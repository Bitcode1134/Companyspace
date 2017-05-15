Game.constants = (function(){

    var instance = {};
    instance.iconPath = "Icons/";
    instance.iconExtension = "png";

    instance.achievementMax = 1000;
    instance.achievementIconsPerRow = 4;
    instance.achievementResourceBrackets = [500, 5000, 50000, 500000, 5000000];
    instance.achievementProducerBrackets = [10, 50, 100, 500, 1000];
    instance.achievementBracketColors = ["#9d9d9d", "#1eff00", "#0070dd", "#a335ee", "#ff8000"];

    instance.achievementCategoryResources = "Resources";
    instance.achievementCategoryProducers = "Producers";

    return instance;
}());