
var dumper = ""
var deepLevel = -1
function dumpYaml(data){
    
    dumper = ""
    runner(data,0,false)
    return dumper
}


function runner(data,level,isArray){

    for(var key in data){
        
        dumper += spaceAdd(level)
        if(isArray){
            dumper+="- "
        }else{
            dumper += key + ": "
        }
        dataInside = data[key]            
        if(checkKeyLength(dataInside) == 0){                       
            dumper+=writeValue(dataInside)+"  "+decideType(key,data)+"\n"
        }else{
            dumper += " "+decideType(key,data)+"\n"
            runner(dataInside,level+1,Array.isArray(dataInside))             
        }       
    }

}

function spaceAdd(num){
    var str=""
    for(var i=0; i<num; i++){
        str +=" "
    }
    return str
}

function writeValue(val){
    var v = val
    if(typeof val == 'string'){
        if(val == '"'){
            v = '\\"'
        }else if(val == '\\'){
            v = "\\\\"
        }        
        return '"'+v+'"'
    }
    return val
}

function checkKeyLength(obj){
    var count = 0
    if(typeof obj != 'object' ){
        return 0;
    }
    for(var k in obj){
        if(obj.hasOwnProperty(k) ){
            count++
        }
    }
    return count
}

function decideType(key, data){
    /*
        #!SpriteFont
        #!Texture2D
        #!List<Rectangle>
        #!Rectangle
        #!List<Char>
        #!Char
        #!List<Vector3>
        #!Vector3
        #!Nullable<Char>
    */
    var tip = ""
    switch (key) {
        case "content":
            tip = "#!SpriteFont"
            break;
        case "texture":
            tip = "#!Texture2D"
            break;
        case "cropping":
        case "glyphs":
            tip = "#!List<Rectangle>"
            break;
        case "characterMap":
            tip = "#!List<Char>"
            break;
        case "kerning":
            tip = "#!List<Vector3>"
            break;
        case "defaultCharacter":
            tip = "#!Nullable<Char>"
            break;
        default:
            if (checkKeyLength(data[key]) == 4) {
                tip = "#!Rectangle"
            } else if (checkKeyLength(data[key]) == 3) {
                tip = "#!Vector3"
            }else if(key!="target" && typeof data[key] == 'string' && data[key].length == 1 ){
                tip = "#!Char"
            }
            
            break;
    }    

    return tip

}

module.exports = {
    dumpYaml: dumpYaml
};