/**
 * The track header view.
 * 
 * Allows for various types of playlist interactions
 * including:
 *  
 *   - play all tracks 
 *   - edit playlist title & description
 *   - delete playlist
 *   - get more results
 *   - adding live tracks to a user playlist
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.TrackHeaderView = Backbone.View.extend({
    
    tagName: "div",
    
    id: "item-header-content",

    events: {
       "click .item-header-play"     : "playAllTracks",
       "click #edit-button"          : "editPlaylist",
       "click #delete-button"        : "deletePlaylist",
       "click #done-button"          : "acceptChanges",
       "click #clear-button"         : "clearTracks",
       "click #save-playlist-button" : "saveAsPlaylist",
       "click #more-tracks-button"   : "getMoreTracks",
       "click #add-live-button"      : "addLiveTracks"
    },

    initialize: function( args )
    {
        this.type = args.type;
        this.model = args.model;
    },


    //-------------------------------------------------------------------------
    // Render Routines
    //-------------------------------------------------------------------------
                              
    render: function()
    {   
        var listModelData,
            isActiveView,
            isPlaying;
            
        listModelData = this.model.toJSON();
        
        // Depending on the state of selected list item and its type
        // choose the appropriate template for rendering.
        
        if( SelectionsApp.Content.isLivePlaylistActive() ) {
            
            this.$el.html( this.livePlaylistTemplate( listModelData ) );
        
        } else if( SelectionsApp.Content.isNowPlayingView() ) {
            
            this.$el.html( this.nowPlayingTemplate( listModelData ) );
                        
        } else if( this.type === 'search' ) {

            this.$el.html( this.searchTemplate( listModelData) );
            
        } else if( this.type === 'playlist' ) {
            
            if( SelectionsApp.Content.getLivePlaylistSize() > 0 ) {
                this.$el.html( this.liveTracksPlaylistTemplate( listModelData ) );
            } else {
                this.$el.html( this.playlistTemplate( listModelData ) );
            }
             
        } else if( this.type === 'bookmark' ) { 
                    
            this.$el.html( this.bookmarkTemplate( listModelData ) );
            
        } else {
            
            this.$el.html( this.externalContentTemplate( listModelData ) );
            
        }


        // Check if playing and update track header UI accordingly      
        isPlaying = SelectionsApp.Player.isPlaying();
        isPlayingView = SelectionsApp.Content.isPlayingView();
        
        if( isPlayingView && isPlaying ) {
            this.$el.addClass( "play" );            
        } else {
            this.$el.removeClass( "play" );
        }
        
        
        return this;
    },
    

    //-------------------------------------------------------------------------
    // Track Header Manipulation Routines
    //-------------------------------------------------------------------------

    editPlaylist: function()
    {
        $('#item-wrapper').addClass( 'edit' );
    },
    
    deletePlaylist: function()
    {
        switch( this.type ) {
            
            case 'playlist':
               if( confirm("Delete '" + this.model.get('title') + "' playlist?") ) {
                    SelectionsApp.Request.deletePlaylist( this.model );
                    $('#item-wrapper').removeClass( 'edit' );
               }
               break;
               
            case 'search':
               if( confirm("Delete '" + this.model.get('title') + "' search item?") ) {
                    SelectionsApp.Request.deleteSearchEntry( this.model );
                    $('#item-wrapper').removeClass( 'edit' );
               }
               break;
        }
    },
    
    saveAsPlaylist: function()
    {
        var title,
            newListModel;
        
        if( SelectionsApp.Content.getCurrentTrackCollection().size() === 0 ) {
            alert( "No tracks found. Please try saving another item as a playlist." );
            return;
        }
        
        title = prompt( "Enter New Playlist Name", this.model.get('title') );
        
        if( title ) {
            newListModel = new SelectionsApp.ListModel( { title: title, description: "My New Playlist" } );     
            SelectionsApp.Request.saveAsPlaylist( newListModel, SelectionsApp.Content.getCurrentTrackCollection() );
        }
    },
    
    getMoreTracks: function()
    {
        SelectionsApp.Request.getMoreTracks( this.model, SelectionsApp.Content.getCurrentTrackCollection() );
    },
    
    addLiveTracks: function()
    {
        if( SelectionsApp.Content.getLiveTrackCollection().size() > 0 ) {
            SelectionsApp.Request.addToPlaylist( this.model, SelectionsApp.Content.getLiveTrackCollection() );
        } else {
            alert("There are currently no live tracks. Add some by exploring the Selections, Genres, and Search sections.");
        }
    },
    
    acceptChanges: function()
    {
        var oldTitle,
            oldDescription,
            newTitle,
            newDescription,
            listItemModel;

        newTitle = $('#item-header-title-input').val();
        newDescription = $('#item-header-description-input').val();
        
        if( !newTitle ) {           
            alert( "Please enter a playlist title." );
            return;
        }

        if( !newDescription ) {           
            alert( "Please enter a playlist description." );
            return;
        }

        $('#item-wrapper').removeClass( 'edit' );
                
        listItemModel = this.model;
        
        oldTitle = listItemModel.get( 'title' );
        oldDescription = listItemModel.get( 'description' );
        
        newTitle = $('#item-header-title-input').val();
        newDescription = $('#item-header-description-input').val();
        
        if( newTitle !== oldTitle || newDescription !== oldDescription ) {
            
            SelectionsApp.Request.updatePlaylist( listItemModel, newTitle, newDescription );
            
        } else {
            
            listItemModel.trigger( 'refresh', listItemModel );
            
        }
    },  
    
    playAllTracks: function()
    {       
        var isPlayingView,
            isPlaying,
            isPaused;
        
        isPaused = SelectionsApp.Player.isPaused();
        isPlaying = SelectionsApp.Player.isPlaying();
        isPlayingView = SelectionsApp.Content.isPlayingView();
        
        if( isPlayingView && ( isPaused || isPlaying ) ) {

                
            if( isPaused ) {
                
                if( SelectionsApp.Player.resumeTrack() ) {
                    this.$el.addClass( "play" );
                }
                            
            } else {
                
                if( SelectionsApp.Player.pauseTrack() ) {
                    this.$el.removeClass( "play" );
                }
                
            }
            
        } else {

            if( SelectionsApp.Player.play() ) {
                this.$el.addClass( "play" );            
            }
        }       
    },
    
    clearTracks: function()
    {
        if( SelectionsApp.Content.isLivePlaylistActive() ) {
            
            SelectionsApp.Content.clearLivePlaylist();
            
        } else if( this.type === 'bookmark' ) {
            
            SelectionsApp.Content.clearBookmarks();
            
        }
    },
    
    
    
    //-------------------------------------------------------------------------
    // Templates for track header UI
    //-------------------------------------------------------------------------
    
    playlistTemplate: _.template( "<div class='item-header-play'></div>" +
                                  "<div id='item-header-actions'>" +
                                      "<div id='edit-button' class='button default-action'>Edit Playlist</div>" +
                                      "<div id='delete-button' class='button edit-action'>Delete Playlist</div>" +
                                      "<div id='done-button' class='button edit-action'>Done</div>" +
                                  "</div>" +
                                  "<div id='item-header-info'>" +   
                                      "<div id='item-header-title' class='default-text'><%= title %></div>" +        
                                      "<div id='item-header-description' class='default-text'><%= description %></div>" +                    
                                      "<div><label for='item-header-title-input'>Title</label><input id='item-header-title-input' class='edit-input' type='text' value='<%= title %>'/></div>" +
                                      "<div><label for='item-header-description-input'>Description</label><input id='item-header-description-input' class='edit-input' type='text' value='<%= description %>'/></div>" +
                                  "</div>" ), 
                                  
    liveTracksPlaylistTemplate: _.template( "<div class='item-header-play'></div>" +
                                  "<div id='item-header-actions'>" +
                                      "<div id='add-live-button' class='button default-action'>Add Live Tracks</div>" +
                                      "<div id='edit-button' class='button default-action'>Edit Playlist</div>" +
                                      "<div id='delete-button' class='button edit-action'>Delete Playlist</div>" +
                                      "<div id='done-button' class='button edit-action'>Done</div>" +
                                  "</div>" +
                                  "<div id='item-header-info'>" +   
                                      "<div id='item-header-title' class='default-text'><%= title %></div>" +        
                                      "<div id='item-header-description' class='default-text'><%= description %></div>" +                    
                                      "<div><label for='item-header-title-input'>Title</label><input id='item-header-title-input' class='edit-input' type='text' value='<%= title %>'/></div>" +
                                      "<div><label for='item-header-description-input'>Description</label><input id='item-header-description-input' class='edit-input' type='text' value='<%= description %>'/></div>" +
                                  "</div>" ),                                    

    searchTemplate: _.template( "<div class='item-header-play'></div>" +
                                  "<div id='item-header-actions'>" +
                                      "<div id='delete-button' class='button default-action'>Delete Search</div>" +
                                      "<div id='more-tracks-button' class='button default-action'>Get More Tracks</div>" +
                                      "<div id='save-playlist-button' class='button default-action'>Save As Playlist</div>" +
                                  "</div>" +
                                  "<div id='item-header-info'>" +   
                                      "<div id='item-header-title' class='default-text single-line'><%= title %></div>" +        
                                  "</div>" ),
                                  
    bookmarkTemplate: _.template( "<div class='item-header-play'></div>" +
                                  "<div id='item-header-actions'>" +
                                      "<div id='clear-button' class='button default-action'>Clear All</div>" +
                                      "<div id='save-playlist-button' class='button default-action'>Save As Playlist</div>" +
                                  "</div>" +
                                  "<div id='item-header-info'>" +   
                                      "<div id='item-header-title' class='default-text single-line'><%= title %></div>" +        
                                  "</div>" ),                                 
                                  
    livePlaylistTemplate: _.template( "<div class='item-header-play'></div>" +
                                  "<div id='item-header-actions'>" +
                                      "<div id='clear-button' class='button default-action'>Clear All</div>" +
                                      "<div id='save-playlist-button' class='button default-action'>Save As Playlist</div>" +
                                  "</div>" +
                                  "<div id='item-header-info'>" +   
                                      "<div id='item-header-title' class='default-text single-line'><%= title %></div>" +        
                                  "</div>" ),

    nowPlayingTemplate: _.template( "<div class='item-header-play'></div>" +
                                  "<div id='item-header-actions'>" +
                                      "<div id='save-playlist-button' class='button default-action'>Save As Playlist</div>" +
                                  "</div>" +
                                  "<div id='item-header-info'>" +   
                                      "<div id='item-header-title' class='default-text single-line'><%= title %></div>" +        
                                  "</div>" ), 
                                  
    externalContentTemplate: _.template( "<div class='item-header-play'></div>" +
                                  "<div id='item-header-actions'>" +
                                      "<div id='more-tracks-button' class='button default-action'>Get More Tracks</div>" +
                                      "<div id='save-playlist-button' class='button default-action'>Save As Playlist</div>" +
                                  "</div>" +
                                  "<div id='item-header-info'>" +   
                                      "<div id='item-header-title' class='default-text single-line'><%= title %></div>" +        
                                  "</div>" )       
    
    
        
});
