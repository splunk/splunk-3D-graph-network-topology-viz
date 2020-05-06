require([
    "jquery",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/searchcontrolsview",
    "splunkjs/mvc/timelineview",
    //"splunkjs/mvc/tableview",
    "splunkjs/mvc/simplexml/ready!"
], function(
    $,
    mvc,
    SearchManager,
    SearchbarView,
    SearchControlsView,
    TimelineView
    //TableView
) {

    var tokens = mvc.Components.get("default");

    // Create the search manager
    var mysearch = new SearchManager({
        id: "base",
        autostart: "false",
        app: "search",
        preview: true,
        cache: true,
        status_buckets: 300,
        required_field_list: "*",
        search: ""
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

    // When the timeline changes, update the search manager
    mytimeline.on("change", function() {
        mysearch.settings.set(mytimeline.val());
    });

    // When the query in the searchbar changes, update the search manager
    mysearchbar.on("change", function() {
        mysearch.settings.unset("search");
        mysearch.settings.set("search", mysearchbar.val());

        // set token value with search string
        var searchString = mysearchbar.val();

        //Collect tokens from the dashboard
        function setToken(name, value) {
          defaultTokenModelun.set(name, value);
          submittedTokenModelun.set(name, value);
        }
        function unsetToken(name) {
          defaultTokenModelun.unset(name);
          submittedTokenModelun.unset(name);
        }
        var defaultTokenModelun = mvc.Components.getInstance('default', { create: true });
        var submittedTokenModelun = mvc.Components.getInstance('submitted', { create: true });

        //Show the edit panel
        setToken("searchString",searchString);

        setToken("earliest",mysearch.settings.attributes.earliest_time);
        setToken("latest",mysearch.settings.attributes.latest_time);

        console.log("Eariest time: " + defaultTokenModelun.get("earliest"));
        console.log("Latest time: " + defaultTokenModelun.get("latest"));
        unsetToken("beforeSearch");
    });

    // When the timerange in the searchbar changes, update the search manager
    mysearchbar.timerange.on("change", function() {
        mysearch.settings.set(mysearchbar.timerange.val());
    });

    // actions for the populate search Buttons
    $('#cidds').on("click", function (e){
      mysearchbar.val("| inputlookup cidds_ip_connections.csv | search src_ip=192.168.* dest_ip=192.168.*");
    });

    $('#bitcoin').on("click", function (e){
      mysearchbar.val("| inputlookup bitcoin_transactions.csv | head 1000 | rename user_id_from as src user_id_to as dest");
    });

    $('#internal').on("click", function (e){
      mysearchbar.val("index=_internal | stats count by source sourcetype");
    });
});
