require([
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/searchcontrolsview",
    "splunkjs/mvc/timelineview",
    //"splunkjs/mvc/tableview",
    "splunkjs/mvc/simplexml/ready!"
], function(
    mvc,
    SearchManager,
    SearchbarView,
    SearchControlsView,
    TimelineView
    //TableView
) {


    var tokens = mvc.Components.get("default");
    console.log(tokens);

    // Create the search manager
    var mysearch = new SearchManager({
        id: "base",
        app: "search",
        preview: true,
        cache: true,
        status_buckets: 300,
        required_field_list: "*",
        search: '| inputlookup cidds_ip_connections.csv | search src_ip=192.168.* dest_ip=192.168.*'
    });

    // Create the views
    var mytimeline = new TimelineView ({
        id: "timeline1",
        managerid: "base",
        el: $("#mytimeline1")
    }).render();

    var mysearchbar = new SearchbarView ({
        id: "searchbar1",
        managerid: "base",
        el: $("#mysearchbar1")
    }).render();

    var mysearchcontrols = new SearchControlsView ({
        id: "searchcontrols1",
        managerid: "base",
        el: $("#mysearchcontrols1")
    }).render();

    //var mytable = new TableView ({
    //    id: "table1",
    //    managerid: "base",
    //    el: $("#mytable1")
    //}).render();

    // When the timeline changes, update the search manager
    mytimeline.on("change", function() {
        mysearch.settings.set(mytimeline.val());
    });

    // When the query in the searchbar changes, update the search manager
    mysearchbar.on("change", function() {
        mysearch.settings.unset("search");
        mysearch.settings.set("search", mysearchbar.val());
        // set token value with search string
        //console.log(mysearch.attributes.search);
        var searchString = mysearch.attributes.search;
        //console.log(searchString);
        //tokens.set("searchString",searchstring);

        //Collect tokens from the dashboard
        function setToken(name, value) {
          defaultTokenModelun.set(name, value);
          submittedTokenModelun.set(name, value);
        }
        var defaultTokenModelun = mvc.Components.getInstance('default', { create: true });
        var submittedTokenModelun = mvc.Components.getInstance('submitted', { create: true });

        //Show the edit panel
        setToken("searchString",searchString);
        console.log(defaultTokenModelun.get("searchString"));
    });

    // When the timerange in the searchbar changes, update the search manager
    mysearchbar.timerange.on("change", function() {
        mysearch.settings.set(mysearchbar.timerange.val());
    });
});