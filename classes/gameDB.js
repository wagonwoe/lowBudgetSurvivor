export class GameDB {
    #db;
    #dbName = "gameScores";
    #version = 1;
    #storeName = "scores";
    #dbRequest;

    scores = [];

    constructor(){
        
    }

    connect() {
        return new Promise((res, rej) => {
            this.#dbRequest = indexedDB.open(this.#dbName, this.#version);
            this.#dbRequest.onupgradeneeded = (ev) =>{
                this.onUpgradeNeeded(ev);
            };
            this.#dbRequest.onsuccess = (ev) => {
                this.#db = ev.target.result;
                res();
            };
            this.#dbRequest.onerror = (ev) => {
                console.log('neco je spatne', ev.target);
                rej();
            };
        })
    }

    onUpgradeNeeded(ev) {
        console.log('upgrade....');
        this.#db = ev.target.result;    
        
        if (!this.#db.objectStoreNames.contains(this.#storeName)) {
                const osSc = this.#db.createObjectStore(this.#storeName, 
                    {keyPath: "id", autoIncrement: true});
                osSc.createIndex('skore','skore');
                osSc.createIndex('jmenoInd', 'jmeno');
                osSc.createIndex('datumInd', 'datum');
        }
    }

    onsuccess(ev) {
        console.log("db otevrena");
        this.#db = ev.target.result; //this.#dbRequest.result;
        this.#db.onerror = function(ev) {
            console.log("db error: ", ev.target.errorCode);
        };	
    }

    insertScore(name, score, date) {
        /// 1. vytvoreni transakce
        const trans = this.#db.transaction(this.#storeName, "readwrite");
        trans.oncomplete = () => {
            console.log('Transakce dokončena.');
        };
        trans.onerror = (e) => {
            console.error('Chyba při transakci:', e.target.errorCode);
        };

        

        const osSc = trans.objectStore(this.#storeName);
        const request = osSc.add({ jmeno: name, skore: score, datum: date});
    
        request.onsuccess = () => {
            console.log('Záznam úspěšně přidán:', { jmeno: name, skore: score, datum: date });
    }
}

    async getScores(){
        const trans = this.#db.transaction(this.#storeName, 'readonly');
        const data = trans.objectStore(this.#storeName).index('jmenoInd').getAll();

        const prom = new Promise((res,rej)=>{
            data.onsuccess = res;
            data.onerror = rej;
        });
        await prom;
        return data.result;
    } 

    printScores() {
        let data = [];
        /// 1. vytvoreni transakce
        const trans = this.#db.transaction(this.#storeName, 'readonly');
        trans.oncomplete = (e) => {
            console.log('trans printScores hotovo', data);
            this.scores = data; 
            this.printHtmlScores(data);           
        }
        trans.onerror = (e) => {
            console.log('trans printScores ERRR', e.target.errorCode);
        }
        
        const osSc = trans.objectStore(this.#storeName);
        const indSc = osSc.index('skore');
        
        indSc.openCursor(null, 'prev').onsuccess = (ev) => {
            let curs = ev.target.result;
            if(curs) {
                console.log(curs.value, curs.key);
                data.push(curs.value);
                // jdu na dalsi zaznam
                curs.continue()
            }else {
                console.log('Už není, co vypsat');
            }
        }
        console.log('konec metody printScores');
    }

    printHtmlScores(data) {
        const tbody = document.getElementById('scoreboard');
        tbody.innerHTML = '';
        let i = 1;
        for(let r of data) {
            console.log(r)
            let tr = document.createElement('tr');
            
            let td = document.createElement('td');
            td.innerHTML = i;            
            tr.appendChild(td);

            td = document.createElement('td');
            td.innerHTML = r.jmeno;
            tr.appendChild(td);
            
            td = document.createElement('td');
            td.innerHTML = r.skore;
            tr.appendChild(td);

            td = document.createElement('td');
            td.innerHTML = r.datum;
            tr.appendChild(td);
            
            tbody.appendChild(tr);
            i++;
        }
    }
}
