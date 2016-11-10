define("zui/base",["zui/base/utils","zui/base/array","zui/base/json","zui/base/date"],function(require){
        
        var zUtils=require("zui/base/utils");
        var zArray=require('zui/base/array');
        var zJson=require("zui/base/json");
        var zDate=require("zui/base/date");
        zUtils.Array=zArray;
        zUtils.JSON=zJson;
        zUtils.Date=zDate;
        if(!window.ZUI) window.ZUI=zUtils;
        return zUtils;
});

      

