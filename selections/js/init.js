/**
 * Entry point for the SoundCloud Selections application.
 * 
 * - Initializes the SoundCloud API
 * - Imports the default music genre definitions
 * - Imports the default music selection definitions
 * - Creates the Content, Request, and Player controllers / views
 * 
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

$(function() {
    
    var defaultSelections,
        selectionModel,
        defaultGenres,
        genreModel,
        i;
    
    // Initialize SoundCloud API    
    SC.initialize({
        client_id: SelectionsApp.Config.getSoundCloudClientId(),
        redirect_uri: SelectionsApp.Config.getSoundCloudRedirectUri()
    }); 
    
    // Create the default collections 
    SelectionsApp.DefaultCollection = SelectionsApp.DefaultCollection || {};
    SelectionsApp.DefaultCollection.Playlists  = new SelectionsApp.ListCollection();
    SelectionsApp.DefaultCollection.Selections = new SelectionsApp.ListCollection();
    SelectionsApp.DefaultCollection.Genres     = new SelectionsApp.ListCollection();
    SelectionsApp.DefaultCollection.Searches   = new SelectionsApp.ListCollection();
    SelectionsApp.DefaultCollection.Bookmarks  = new SelectionsApp.ListCollection();
    
    // Set custom playlist comparator for alphabetical order   
    SelectionsApp.DefaultCollection.Playlists.comparator = function( listItem )
    {
        return listItem ? listItem.get("title").toLowerCase() : 0;
    };
    
    
    // Add default selections & genres & bookmarks
    defaultSelections = SelectionsApp.Config.getDefaultSelections();
    defaultGenres = SelectionsApp.Config.getDefaultGenres();
        
    for( i = 0; i < defaultSelections.length; i++ ) {
        selectionModel = new SelectionsApp.ListModel( defaultSelections[i] );
        SelectionsApp.DefaultCollection.Selections.add( selectionModel );
    }   
    
    for( i = 0; i < defaultGenres.length; i++ ) {
        genreModel = new SelectionsApp.ListModel( defaultGenres[i] );
        SelectionsApp.DefaultCollection.Genres.add( genreModel );
    }   
    
    // Create the default app controllers/views
    SelectionsApp.Content = new SelectionsApp.ContentView();
    SelectionsApp.Request = new SelectionsApp.RequestView();
    SelectionsApp.Player = new SelectionsApp.PlayerView();
});
