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
        this.updateActiveHeader( '#nav-playlist' );
    },
    
    showSelections: function()
    {
        SelectionsApp.Content.showSelections();
        this.updateActiveHeader( '#nav-selection' );
    },

    showGenres: function()
    {
        SelectionsApp.Content.showGenres();
        this.updateActiveHeader( '#nav-genre' );
    },

    showSearches: function()
    {
        SelectionsApp.Content.showSearches();
        this.updateActiveHeader( '#nav-search' );
    },
    
    showBookmarks: function()
    {
        SelectionsApp.Content.showBookmarks();
        this.updateActiveHeader( '#nav-bookmark' );
    },

    logout: function()
    {
        SelectionsApp.Content.logout();
    },
    
    updateActiveHeader: function( elementId )
    {
        if( this.activeHeader ) {
            $(this.activeHeader).removeClass( 'selected' );
        }
        
        this.activeHeader = elementId;
        $(this.activeHeader).addClass( 'selected' );
    }
    
});
