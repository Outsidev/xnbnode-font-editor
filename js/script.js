$(function(){        
    fs = require('fs')
    yaml = require('js-yaml')
    handlebars = require('handlebars')
    const Path = require('path')
    const {dialog} = require('electron').remote
    customyaml = require('./js/custom-yaml')

    var infoCard = $('#info-card').html()
    var editCard = $('#edit-card').html()

    var data;
    $('.file-selector').on('click', function(){
        var self = this
        dialog.showOpenDialog( { filters:[{name:'yaml', extensions:['yaml']}] }, function(fileNames){
            if(fileNames == undefined){
                console.log("no file selected")
            }else{                
                data = readFile(fileNames[0])
                if(data != null){
                    var pathName = Path.basename(fileNames[0], '.yaml')
                    $(self).removeClass("btn-danger").addClass("btn-primary")
                    $(self).html(pathName)
                    $(self).data('filePath', fileNames[0])
                }else{
                    $(self).removeClass("btn-primary").addClass('btn-danger')
                    $(self).html("Cant Read File!")
                }
            }
        })
    })
    
    //data = readFile("./static/ornek.yaml")
    //console.log(customyaml.dumpYaml(data))
    //fs.writeFileSync("./static/newTest.yaml",customyaml.dumpYaml(data))

    $('.arasana').on('input', function(){
        var datkey = $(".arasana").val()
        datkey = datkey[datkey.length-1]
        var charInfomans = returnCharInfo(data, datkey)
        $('.arasana').val(datkey)

        if (charInfomans != null) {
            var cikti = getBeardedHtml(charInfomans, infoCard)
            $('.search-results').html(cikti)
        } else {
            $('.char-name').html("Not found")
            $('.search-results').html("")
        }
        
    });    

    $('.eklesene').on('input', function(){
        var datkey = $(".eklesene").val()
        datkey = datkey[datkey.length-1]
        var charInfomans = returnCharInfo(data, datkey)
        $('.eklesene').val(datkey)

        if (charInfomans != null) {
            var cikti = getBeardedHtml(charInfomans, editCard)
            $('.adding-results').html(cikti)            
            $('.add-or-edit-char').removeClass("hidden")
            $('.check-char-label').css('visibility', 'visible')
            $(".add-or-edit-char").html("Edit Character");
        } else {
            var nullCharInfomans = returnCharInfo(data, "a", true)
            var cikti = getBeardedHtml(nullCharInfomans, editCard)
            $('.adding-results').html(cikti)            
            $('.add-or-edit-char').removeClass("hidden")  
            $('.check-char-label').css('visibility', 'hidden')
            $(".add-or-edit-char").html("Add New Character");
        }

    });

    $('.add-or-edit-char').on('click', function(){        
        var newChar = getCharacterFromTextBoxes(data,".edit-card")
        addNewCharToData(data, newChar)
        console.log(data)
        var writePath = $('.file-selector').data('filePath')
        console.log(writePath)
        try{
            fs.writeFileSync(writePath,customyaml.dumpYaml(data))
            var box = "<span class='message-label label label-success'>Success! File written. </span>"
            $('.file-write-message').html(box)
            animateInOut('.message-label', 'flipInX', 'fadeOutUp')               
        }catch(err){
            console.log(err)
            var box = "<span class='message-label label label-danger'>Error.</span>"
            $('.file-write-message').html(box)
            animateInOut('.message-label', 'bounceIn', 'fadeOutDown')
        }        
    });

    $('.copy-values').on('click',function(){
        console.log("kopy")
        var existingChar = getCharacterFromTextBoxes(data, ".info-card")
        var cikti = getBeardedHtml(existingChar, editCard)
        $('.adding-results').html(cikti)
    })

    var getBeardedHtml = function(charInfomans, cardName) {        
        var cikti = ""
        for (var key in charInfomans.content) {
                var content = charInfomans.content[key]
                if (Object.keys(content).length < 1 || key == "characterMap") {
                    continue;
                }
                content = {[key] : content}          
                var template = handlebars.compile(cardName)
                cikti += template(content)  
            }
        return cikti;
    }
})

function readFile(filePath) {
    try {
        var inFile = fs.readFileSync(filePath, 'utf8'),
            data = yaml.load(inFile);

        console.log("ov ye.")
        console.log(data)
        return data
    } catch (err) {
        console.log(err)
        return null
    }
}

function animateThat(obj, anim){
    $(obj).addClass('animated ' + animin).one('animationend', function () {
        $(this).removeClass(anim)
    });
}

function animateInOut(obj, animin, animgo){
    $(obj).addClass('animated ' + animin).one('animationend', function () {
        $(this).removeClass(animin)
        $(this).addClass('delayed-fadeout '+animgo)
    });
}


function getCharacterFromTextBoxes(data, cardName){
    var nullCharInfomans = returnCharInfo(data, "a", true)
    $(cardName).each(function(){
        var ka = {}
        $(this).find(':input').each(function(){
            ka[ $(this).data("content-type") ] = Number($(this).val())
        })

        var contentName = $(this).data("content-name")
        nullCharInfomans.content[contentName] = ka;
    })
    var barname = ".eklesene";
    if(cardName == ".info-card"){
        barname = ".arasana"    
    }

    nullCharInfomans.content.characterMap = $(barname).val()    
    return nullCharInfomans
}

function addNewCharToData(data, newChar){    
    var index = checkCharExists(data,newChar.content.characterMap);
    if(index != -1)
    {
        console.log("char edited")
        data.content.glyphs[index] = newChar.content.glyphs
        data.content.cropping[index] = newChar.content.cropping
        data.content.kerning[index] = newChar.content.kerning
        data.content.characterMap[index] = newChar.content.characterMap

    } else {
        console.log("char added")
        data.content.glyphs.push(newChar.content.glyphs)
        data.content.cropping.push(newChar.content.cropping)
        data.content.kerning.push(newChar.content.kerning)
        data.content.characterMap.push(newChar.content.characterMap)
    }    

}


function returnCharInfo(data, char, returnEmptyValues=false){    
    //if char exists
    var index = checkCharExists(data,char);
    if(index == -1){
        return null
    }
    var datason = {content:{}}
    for(key in data.content){
        var contentInside = {}                
        for(key2 in data.content[key][index]){
            var num;
            if(returnEmptyValues)
            {   num = "" }
            else{
                num = data.content[key][index][key2];
                if(isNumeric(num) && num%1!=0){
                    num = num.toFixed(3)
                }
            }            
            contentInside[key2] = num            
        }
        datason.content[key] = contentInside        
    }

    return datason;
}

function checkCharExists(data,char){
    var index = data.content.characterMap.indexOf(char);
    return index;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}