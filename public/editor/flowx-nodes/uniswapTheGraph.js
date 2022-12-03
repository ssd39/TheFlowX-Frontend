(function(global) {
    var LiteGraph = global.LiteGraph;

    let datamap  = {
        uint256:"number",
        address:"string",
        bool:"bool",
        string:"string"
    } 

    function UniswapQuery(){
        this.width = 500;
        this.height = 50;

        this.eventsData = {}
        this.lastEVal = null;
        this.addInput("Execute", "boolean,number,string");
        this.addInput("Pool Address", "string");
        this.addOutput("Locked Amount", "number")
        //this.widget = this.addWidget("text","Contract Address","","cvalue");  //link to property value
        //this.widgets_up = true;
        this.resetSize()
    }

    UniswapQuery.prototype.onPropertyChanged =function(name, value){
        /*console.log(value)
        if(name=="cvalue" && value==""){
            return;
        }else if(name=="evalue" && !this.eventsData.hasOwnProperty(value)){
            return;
        }
        if(name=="cvalue"){
            this.parseContract(value)
        }else if(name=="evalue"){
            if(!this.lastEVal){
                this.manageOutput(value, null);
                this.lastEVal = value;
                return;
            }
            this.manageOutput(value, this.lastEVal);
            this.lastEVal = value;
        }*/
    }

    UniswapQuery.prototype.manageOutput = function(eventName, lastEvent){
        if(lastEvent){
           for(let x of this.eventsData[lastEvent]){
            console.log(x)
            this.removeOutput(x.name)
           }
        }
        this.height = 100;
        for(let x of this.eventsData[eventName]){
            let type_ = 'number'
            if(datamap.hasOwnProperty(x.type)){
                type_ = datamap[x.type]
            }
            this.addOutput(x.name, type_);
            this.height +=10;
        }
        this.resetSize()   
    }

    UniswapQuery.prototype.resetSize = function(){
        this.size = [this.width, this.height];
    }

    UniswapQuery.prototype.parseContract = async function(contract_address){
        $("#loader").css('display','block');
        let abi;
        try{
         abi = await (await fetch(`http://localhost:4040/contract?contractadd=${contract_address}`)).json()
        }catch(e){
            $("#loader").css('display','none');
            return;
        }
        for(let o of abi.abi){
            if(o.type=='event'){
                let name = o.name;
                this.eventsData[name] = o.inputs   
            }
        }

        let values = []
        for(let x in this.eventsData){
            values.push(x)
        }
        let context = this;
        let iniVal = values[0];
        if(context.getInputOrProperty("evalue")){
            iniVal = context.getInputOrProperty("evalue")
        }
        this.combo = this.addWidget("combo","Event Name", iniVal, function(v){
            context.setProperty("evalue", v)
        }, { values });

        if(context.getInputOrProperty("evalue")){
            this.manageOutput(context.getInputOrProperty("evalue"), null)
            this.lastEVal = context.getInputOrProperty("evalue")
        }else{
            this.manageOutput(values[0], null)
            this.lastEVal = values[0]
            context.setProperty("evalue", values[0])
        }
        this.resetSize()
        $("#loader").css('display','none');
    }

    UniswapQuery.title = "Liqudity Query";
    UniswapQuery.desc = "Query Liqudity On Uniswap using theGraph";

    LiteGraph.registerNodeType("theGraph/Uniswap Liqudity", UniswapQuery);

})(this)