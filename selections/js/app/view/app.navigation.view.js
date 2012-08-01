/** The Navigation view.
 * 
 *  This view is a simple way to provide navigation
 *  between the various parts of the applcation.
 *  
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.NavigationView = Backbone.View.extend({

    initialize: function()
    {
        this.setElement( $('#header') );
    },
    
    events: {
       "click #nav-playlist" : "showPlaylists",
       "click #nav-selection" : "showSelections",
       "click #nav-genre" : "showGenres",
       "click #nav-search" : "showSearches",
       "click #nav-bookmark" : "showBookmarks",
       "click #nav-logout" : "logout"
    },
    
    showPlaylists: function()
    {
        SelectionsApp.Content.showPlaylists();
    },
    
    showSelections: function()
    {
        SelectionsApp.Content.showSelections();
    },

    showGenres: function()
    {
        SelectionsApp.Content.showGenres();
    },

    showSearches: function()
    {
        SelectionsApp.Content.showSearches();
    },
    
    showBookmarks: function()
    {
        SelectionsApp.Content.showBookmarks();
    },

    logout: function()
    {
        SelectionsApp.Content.logout();
    }
    
});
