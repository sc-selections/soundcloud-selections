/** The app content view / controller.
 * 
 *  This is the main object that enables interactivity
 *  and movement within the application.
 *  
 *  It provides management for when to request tracks,
 *  when to request list content, and when to move
 *  between views.
 *  
 *  It also acts as a listener to most of the available
 *  actions application-wide and ensures all views are
 *  in sync.
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */


SelectionsApp.ContentView = Backbone.View.extend({
    
    events: {
       "click #app-login-button" : "login"
    },
	
    initialize: function()
    {
        this.setElement( $('#app-wrapper') );
		
		this.navigationView = new SelectionsApp.NavigationView();
        
        this.livePlaylist = new SelectionsApp.ListModel({
            title: "Live Playlist",
            description: "My Selected Tracks"
        });

        this.defaultBookmark = new SelectionsApp.ListModel({
            title: "Bookmarks"
        });

		SelectionsApp.DefaultCollection.Bookmarks.add( this.defaultBookmark );
		
        this.livePlaylist.addSelectListener( this.onLivePlaylistSelect );
        
        this.liveTrackCollection = new SelectionsApp.TrackCollection();
        this.liveTrackCollection.addInsertListener( this.onLivePlaylistUpdate );
        this.liveTrackCollection.addRemoveListener( this.onLivePlaylistUpdate );
    },
	
	login: function()
	{
		var contentView = this;
		
        SC.connect(function() {

		    SC.get( "/me", null, function( user, error ) {
	            
	            if( !error ) {
                    
					// Update user id
					SelectionsApp.Request.setUserId( user.id );
					
                    // Display content
                    contentView.$el.addClass( 'logged-in' );

	                // Show playlists by default
	                SelectionsApp.Content.showPlaylists();         
	            
	            } else {
	                
	                alert( "Login error occurred. Please try again later. [" + error.message + "]" );
	
	            }
				
	        });
			
		});
		
	},
    
	logout: function()
	{
		this.close();
		window.location.href = '/';
	},
	
    showPlaylists: function()
    {
        this.close();
		
        this.currentListCollection = SelectionsApp.DefaultCollection.Playlists;       
        this.currentListCollection.addSelectListener( this.onListSelect );
        this.currentListCollection.addInsertListener( this.onListInsert );
        this.currentListCollection.addChangeListener( this.onListChange );
        this.currentListCollection.addRemoveListener( this.onListRemove );
		this.currentListCollection.addRefreshListener( this.onListChange );

        this.type = 'playlist';
        this.showListView( this.type, this.currentListCollection );
		
        SelectionsApp.Request.getPlaylists();
    },
	
    showSelections: function()
    {
        this.close();
        
        this.currentListCollection = SelectionsApp.DefaultCollection.Selections;       
        this.currentListCollection.addSelectListener( this.onListSelect );

        this.type = 'selection';
        this.showListView( this.type, this.currentListCollection );
    },	
    
    showGenres: function()
    {
        this.close();
        
        this.currentListCollection = SelectionsApp.DefaultCollection.Genres;       
        this.currentListCollection.addSelectListener( this.onListSelect );

        this.type = 'genre';
        this.showListView( this.type, this.currentListCollection );
    },  	
	
    showSearches: function()
    {
        this.close();
        
        this.currentListCollection = SelectionsApp.DefaultCollection.Searches;       
        this.currentListCollection.addSelectListener( this.onListSelect );
        this.currentListCollection.addInsertListener( this.onListInsert );
        this.currentListCollection.addRemoveListener( this.onListRemove );
    
        this.type = 'search';
	    this.showListView( this.type, this.currentListCollection );
		
		SelectionsApp.Request.getSearchEntries();
    }, 	
	
    showBookmarks: function()
    {
        this.close();
        
        this.currentListCollection = SelectionsApp.DefaultCollection.Bookmarks;       
        this.currentListCollection.addSelectListener( this.onListSelect );
    
        this.type = 'bookmark';
        this.showListView( this.type, this.currentListCollection );
    },  	
	
	showListView: function( type, collection )
	{
        this.currentListView = new SelectionsApp.ListContentView( { type: type, collection: collection });
        this.currentListView.render();
		
        this.updateLivePlaylist();
	},

	showEmptyTrackContent: function()
	{
		this.currentTrackView.setEmpty( true );
	},
	
	showEmptyBookmarkContent: function()
	{
		this.currentTrackView.setEmptyBookmark( true );
	},
	
    getCurrentTrackCollection: function()
    {
        return this.currentTrackCollection;
    },
	
    getLiveTrackCollection: function()
    {
        return this.liveTrackCollection;
    },
		
    getCurrentListModel: function()
    {
        return this.currentTrackView.listModel;
    },	
	
	addDynamicPlaylist: function( listItem, className )
	{
		this.currentListView.addDynamicPlaylist( listItem, className );
	},
    
    showTracks: function( listModel )
	{
		if( listModel === this.livePlaylist ) {
			
			this.currentTrackCollection = this.liveTrackCollection;

        } else if( listModel === SelectionsApp.Player.getNowPlayingList() ) {

            this.currentTrackCollection = SelectionsApp.Player.getNowPlayingTrackCollection();
			
		} else {

	        this.currentTrackCollection = new SelectionsApp.TrackCollection();
	        this.currentTrackCollection.addInsertListener( this.onTrackInsert );
	        this.currentTrackCollection.addRefreshListener( this.onTrackRefresh );
	        this.currentTrackCollection.addRemoveListener( this.onTrackRemove );

	        
			switch( this.type ) {
				
                case 'playlist':
                    SelectionsApp.Request.getPlaylistTracks( listModel, this.currentTrackCollection );
                    break;              
				
                case 'selection':
                    SelectionsApp.Request.getSelectionTracks( listModel, this.currentTrackCollection );
                    break;

                case 'genre':
                    SelectionsApp.Request.getGenreTracks( listModel, this.currentTrackCollection );
                    break;
                                    
                case 'search':
                    SelectionsApp.Request.getSearchTracks( listModel, this.currentTrackCollection );
                    break;

                case 'bookmark':
                    SelectionsApp.Request.getBookmarkTracks( listModel, this.currentTrackCollection );
                    break;
			}		
			
            SelectionsApp.Request.setType( this.type );			

        }
		
        this.currentTrackView = new SelectionsApp.TrackContentView({ 
            type: this.type, 
            listModel: listModel, 
            tracks: this.currentTrackCollection 
        });
            
        this.currentTrackView.render();
		    
	},  
	
	addTrack: function( track, collection, options )
	{
		if( collection === this.currentTrackCollection ) {
	        var clearList = this.currentTrackCollection.size() === 1;
	        this.currentTrackView.addTrack( track, clearList );
		}
	},

    removeTrack: function( track, collection, options )
    {
        if( collection === this.currentTrackCollection ) {
    		this.currentTrackView.removeTrack( options.index );
		}
    },
		
	addLivePlaylistTrack: function( track )
	{
		if( track ) {
		    this.liveTrackCollection.add( track );
		}
	},
	
    removeLivePlaylistTrack: function( track )
    {
        if( track ) {
            this.liveTrackCollection.remove( track );
        }
    },	
	
	isLivePlaylistActive: function()
	{
		return this.currentTrackView.getListModel() === this.livePlaylist;
	},
	
	isLivePlaylistTrack: function( track )
	{
        if( track ) {
            return this.liveTrackCollection.containsTrackId( track.id );
        }
		
		return false;		
	},
	
    getLivePlaylistSize: function()
    {        
        return this.liveTrackCollection.size();
    },	
	
	addListItem: function( listItem, options )
	{
        this.currentListView.addListItem( listItem, this.type !== 'playlist', options.index-1, options.select );		
	},
	
	removeListItem: function( listItem, options )
	{
        this.currentListView.removeListItem( options.index );
	},
	
	updateList: function( listItem, options )
	{
        var index = options ? options.index : this.currentListCollection.indexOf( listItem );   

        // Update index to account for the "Live Playlists" list item at the top
        if( this.liveTrackCollection.size() > 0 ) {
            index++;
        }
        
		// Update index to account for the "Now Playing" list item at the top
        if( SelectionsApp.Player.getCurrentTrack() ) {
            index++;
        }

        this.currentTrackView.refreshHeader();           
        this.currentListView.refreshListItem( listItem, index );
	},
	
	updateLivePlaylist: function()
	{        
	    var numLiveTracks = this.liveTrackCollection.size();

        if( numLiveTracks > 0 ) {
			
            this.livePlaylist.set( {title: 'Live Playlist (' + numLiveTracks + ')'} );         
            this.currentListView.addDynamicPlaylist( this.livePlaylist, 'list-item-live', this.isLivePlaylistActive() );
						
        } else {
            this.currentListView.removeDynamicPlaylist( 'list-item-live', true );
        }
		
        SelectionsApp.Player.updateNowPlayingPlaylist();				
	},

	updateTrack: function( track, collection, options )
	{
		var index,
		    select;
		
		select = SelectionsApp.Player.getCurrentTrack() === track; 
		index = SelectionsApp.Content.getCurrentTrackCollection().indexOf( track );
		
		this.currentTrackView.refreshTrack( track, index, select );
	},
	
	updateHeader: function()
	{
        this.currentTrackView.refreshHeader();           
	},
	
	clearLivePlaylist: function()
	{
		this.liveTrackCollection.reset();
		this.updateLivePlaylist();
	},
	
	clearBookmarks: function()
	{
		SelectionsApp.Config.clearBookmarks();
		this.currentTrackCollection.reset();
		alert( "Bookmarks cleared.");
	},
	
    isPlayingView: function()
    {
        return this.currentTrackCollection === SelectionsApp.Player.getNowPlayingTrackCollection();
    },	
    
    close: function()
    {
        if( this.currentListView ) {
            this.currentListView.close();
        }
        
        if( this.currentListCollection ) {
            this.currentListCollection.off();
        }
		
		if( this.currentTrackCollection ) {
            this.currentTrackCollection.off();
		}
    },
		
    
    onListSelect: function( listModel )
    {
		SelectionsApp.Content.showTracks( listModel );
    },

    onListInsert: function( listItem, collection, options )
    {
        SelectionsApp.Content.addListItem( listItem, options );
    },
    
    onListChange: function( listItem, collection, options )
    {
		SelectionsApp.Content.updateList( listItem, options );
    },	
	
    onListRemove: function( listItem, collection, options )
    {
	    SelectionsApp.Content.removeListItem( listItem, options );
    },	
	
    onTrackInsert: function( track, collection, options )
    {
		SelectionsApp.Content.addTrack( track, collection, options );
    },	
	
    onTrackRemove: function( track, collection, options )
    {
        SelectionsApp.Content.removeTrack( track, collection, options );
    }, 
	
    onTrackRefresh: function( track, collection, options )
    {
        SelectionsApp.Content.updateTrack( track, collection, options );
    },	 
	
	onLivePlaylistUpdate: function()
	{
		SelectionsApp.Content.updateLivePlaylist();
	},
	
    onLivePlaylistSelect: function( listModel )
    {
        SelectionsApp.Content.showTracks( listModel );
    }	 
});
