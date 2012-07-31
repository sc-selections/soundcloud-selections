/** The Resource Request view / controller.
 * 
 *  This controller provides the facilities for the UI to
 *  request tracks from the database or from SoundCloud.
 *  
 *  Also includes support for requests to create / edit
 *  playlists.
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.RequestView = Backbone.View.extend({

    initialize: function( args )
	{
		this.defaultOffset = 0;
		this.defaultLimit = 10;
	},
	
	setUserId: function( userId )
	{
		this.userId = userId;
	},	
	
	setType: function( type )
	{
		this.type = type;
	},
    	
		

	//-------------------------------------------------------------------------
    // SoundCloud Track Requests
    //-------------------------------------------------------------------------
    
	getSelectionTracks: function( listItem, collection, offset, limit )
    {
		var request = this; 
		
		offset = offset || this.defaultOffset;
		limit  = limit  || this.defaultLimit;
		
        SC.get( listItem.get('path'), $.extend({}, listItem.get('options'), { offset: offset, limit: limit } ),
		
			function( tracks ) {
			    request.addSoundCloudTracks( tracks, collection );
			}
				
	    );           
    },	
	
    getGenreTracks: function( listItem, collection, offset, limit )
    {
        var request = this; 
        
        offset = offset || this.defaultOffset;
        limit  = limit  || this.defaultLimit;
        
        SC.get( "/tracks", { genres: listItem.get('title'), order: "hotness", offset: offset, limit: limit },
        
            function( tracks ) {
                request.addSoundCloudTracks( tracks, collection );
            }
                
        );           
    },
	
    getSearchTracks: function( listItem, collection, offset, limit )
    {
        var request = this; 
        
        offset = offset || this.defaultOffset;
        limit  = limit  || this.defaultLimit;
        
        SC.get( "/tracks", { q: listItem.get('title'), order: "hotness", offset: offset, limit: limit },
        
            function( tracks ) {
                request.addSoundCloudTracks( tracks, collection );
            }
                
        );     
    },
	
    
    getBookmarkTracks: function( listItem, collection )
    {
		var bookmarks,
		    i;

        bookmarks = SelectionsApp.Config.getBookmarks();

        for( i = 0; i < bookmarks.length; i++ ) {
            
            SC.get('/tracks/' + bookmarks[i], function( track, error ) {
    
                if( !error ) {
    
                    trackModel = new SelectionsApp.TrackModel({ 
                        id: track.id,
                        title: track.title, 
                        description: track.user.username,
                        data: track 
                    });

                    collection.add( trackModel );
                }
            });
        }           
		
		setTimeout( function() {

	        if( bookmarks.length === 0 )  {
	            SelectionsApp.Content.showEmptyBookmarkContent();
	        }    
			
		});
		
    },	
	
	getMoreTracks: function( listItem, collection )
	{
        var request,
		    offset,
			limit;
			
		request = this; 
        
        offset = collection.size();
        limit  = this.defaultLimit;
        
        switch( this.type ) {
            
            case 'selection':
                this.getSelectionTracks( listItem, collection, offset, limit );
                break;

            case 'genre':
                this.getGenreTracks( listItem, collection, offset, limit );
                break;
                                
            case 'search':
                this.getSearchTracks( listItem, collection, offset, limit );
                break;

        }
	},

    addSoundCloudTracks: function( tracks, collection )
    {
        var trackData,
            trackModel,
            numTracks,
            i;
        
        numTracks = tracks.length;
        
        for( i = 0; i < numTracks; i++ ) {
            
            trackData  = tracks[i];
            trackModel = new SelectionsApp.TrackModel({ 
                id: trackData.id,
                title: trackData.title, 
                description: trackData.user.username,
                data: trackData 
            });
            
            collection.add( trackModel );
        }    
		
        if( numTracks === 0 ) {
            SelectionsApp.Content.showEmptyTrackContent();
        }    
		   
    },


	

    //-------------------------------------------------------------------------
    // User Playlist Requests
    //-------------------------------------------------------------------------
    getPlaylists: function()
    {
        var request,
		    playlists,
            playlistData,
            playlistModel,
            numPlaylists,
            i;
               
        request = this;     
		
        this.ajaxPostJson({
            
            url: '/resource/selections.php',
            
            data: {
                action: 'get_playlists',
                user_id: this.userId
            },
            
            success: function( response ) {
                
                if( response.status !== 1 ) {
                    alert( "Error loading playlists. Please try again later." );
                    return;
                }
                
                playlists = response.data;
                numPlaylists = playlists.length;
                
                for( i = 0; i < numPlaylists; i++ ) {
                    
                    playlistData = playlists[i];
                    
                    playlistModel = new SelectionsApp.ListModel({ 
                        id: playlistData.id,
                        title: playlistData.title, 
                        description: playlistData.description,
                        data: playlistData 
                    } );

                    SelectionsApp.DefaultCollection.Playlists.add( playlistModel );
                }
				
				if( numPlaylists === 0 ) {
					
                    playlistModel = new SelectionsApp.ListModel({ 
                        title: "New Playlist",
                        description: "My First Playlist"
                    } );
					
					request.addPlaylist( playlistModel );
				}    

            }               
        });
    },
		
    addPlaylist: function( listItem, callback )
    {
        this.ajaxPostJson({
            
            url: '/resource/selections.php',
            
            data: {
                action: 'add_playlist',
				user_id: this.userId,
                title: listItem.get('title'),
				description: listItem.get('description')
            },
            
            success: function( response ) {
				
                if( response.status !== 1 ) {
                    alert( "Error saving playlist. Please try again later." );
                    return;
                }
				
				listItem.set( {id: response.data} );
                SelectionsApp.DefaultCollection.Playlists.add( listItem, {select: true} );
				
				if( callback ) {
					callback( listItem );
				}				
			}
		});
	},
	
	saveAsPlaylist: function( listItem, trackCollection )
	{
        var request,
		    numTracks,
		    trackIds = '';

        request = this;
        
        // Get playlist tracks ids as comma-separated values								
        numTracks = trackCollection.size();
		
		trackCollection.forEach( function(track) {
			trackIds += track.id + ',';
		});
		
        if( numTracks > 0 ) {     
		    trackIds = trackIds.substring( 0, trackIds.length-1 );
		}		
		
        // Switch to the playlist view
        SelectionsApp.Content.showPlaylists();
		
        // Add playlist and its tracks
		this.addPlaylist( listItem, function( playlist ) {

            if( numTracks > 0 ) {     
                request.addPlaylistTracks( playlist, trackIds );
			}
			
		});
	},
	
	addToPlaylist: function( playlist, trackCollection )
	{
        var numTracks,
            trackIds = '';

        // Get playlist tracks ids as comma-separated values                                
        numTracks = trackCollection.size();
        
        trackCollection.forEach( function(track) {
            trackIds += track.id + ',';
        });
        
        if( numTracks > 0 ) {     
            trackIds = trackIds.substring( 0, trackIds.length-1 );
        }       
                
        // Add tracks to playlist tracks
        if( numTracks > 0 ) {     
            this.addPlaylistTracks( playlist, trackIds );
        }		
		
		// clear the live tracklist
		if( SelectionsApp.Content.getLiveTrackCollection() === trackCollection ) {
			SelectionsApp.Content.clearLivePlaylist();
		}
	},


    updatePlaylist: function( listItem, newTitle, newDescription )
    {
        this.ajaxPostJson({
            
            url: '/resource/selections.php',
            
            data: {
                action: 'update_playlist',
                user_id: this.userId,
				playlist_id: listItem.id,
                title: newTitle,
                description: newDescription
            },
            
            success: function( response ) {
                
                if( response.status !== 1 ) {
                    alert( "Error saving playlist. Please try again later." );
                    return;
                }
                
                listItem.set( { title: newTitle, description: newDescription } );
            }
        });
    },
	
    deletePlaylist: function( listItem )
    {
        var tracks,
            trackData,
            trackModel,
            numTracks,
            i;
                    
        this.ajaxPostJson({
            
            url: '/resource/selections.php',
            
            data: {
                action: 'delete_playlist',
                user_id: this.userId,
                playlist_id: listItem.id
            },
            
            success: function( response ) {
                
                if( response.status !== 1 ) {
                    alert( "Error deleting playlist. Please try again later." );
                    return;
                }
                
                SelectionsApp.DefaultCollection.Playlists.remove( listItem );                
            }
        });
    },	
	
    addPlaylistTracks: function( playlist, trackIds )
    {
        this.ajaxPostJson({
            
            url: '/resource/selections.php',
            
            data: {
                action: 'add_playlist_tracks',
                user_id: this.userId,
                playlist_id: playlist.id,
                track_ids: trackIds
            },
            
            success: function( response ) {
                
                if( response.status !== 1 ) {
                    alert( "Error removing playlist track. Please try again later." );
                    return;
                }
                
				playlist.trigger( 'refresh', playlist ); 
            }               
        });
    },	
	
    removePlaylistTrack: function( track )
    {
		var playlistId,
		    trackCollection;
		
		playlistId = SelectionsApp.Content.getCurrentListModel().id;		
		trackCollection = SelectionsApp.Content.getCurrentTrackCollection();
        
        this.ajaxPostJson({
            
            url: '/resource/selections.php',
            
            data: {
                action: 'remove_playlist_track',
				id: track.get('nativeId'),
				user_id: this.userId,
                playlist_id: playlistId,
				track_id: track.id
            },
            
            success: function( response ) {
                
                if( response.status !== 1 ) {
                    alert( "Error removing playlist track. Please try again later." );
                    return;
                }
 
                trackCollection.remove( track );
                
                if( trackCollection.size() === 0 ) {
                    SelectionsApp.Content.showEmptyTrackContent();
                }    
				
            }               
        });
    },
	
    getPlaylistTracks: function( listItem, trackCollection )
    {
        var tracks,
            trackData,
            trackModel,
            numTracks,
			nativeId,
            i;
                    
        this.ajaxPostJson({
            
            url: '/resource/selections.php',
            
            data: {
                action: 'get_playlist_tracks',
                playlist_id: listItem.id
            },
            
            success: function( response ) {
                
                if( response.status !== 1 ) {
                    alert( "Error loading playlists. Please try again later." );
                    return;
                }
                
                tracks = response.data;
                numTracks = tracks.length;
                
                for( i = 0; i < numTracks; i++ ) {
					
					nativeId = tracks[i].id;
					
	                SC.get('/tracks/' + tracks[i].track_id, function( scTrack ) {

			            trackModel = new SelectionsApp.TrackModel({ 
			                id: scTrack.id,
							nativeId: nativeId,
			                title: scTrack.title, 
			                description: scTrack.user.username,
			                data: scTrack 
			            });
			            
			            trackCollection.add( trackModel );
	                });
                }
				
                if( numTracks === 0 ) {
                    SelectionsApp.Content.showEmptyTrackContent();
                }    
				
			}               
        });
    },
	
	
	
    //-------------------------------------------------------------------------
    // User Search History Requests
    //-------------------------------------------------------------------------
    getSearchEntries: function()
    {
        var searches,
            searchData,
            searchModel,
            numSearches,
            i;
                    
        this.ajaxPostJson({
            
            url: '/resource/selections.php',
            
            data: {
                action: 'get_search_entries',
                user_id: this.userId
            },
            
            success: function( response ) {
                
                if( response.status !== 1 ) {
                    alert( "Error loading playlists. Please try again later." );
                    return;
                }
                
                searches = response.data;
                numSearches = searches.length;
                
                for( i = 0; i < numSearches; i++ ) {
                    
                    searchData = searches[i];
                    
                    searchModel = new SelectionsApp.ListModel({ 
                        id: searchData.id,
                        title: searchData.query, 
                        data: searchData 
                    } );
                    
                    SelectionsApp.DefaultCollection.Searches.add( searchModel );
                }    

            }               
        });
    },   
		
    addSearchEntry: function( listItem )
    {
        this.ajaxPostJson({
            
            url: '/resource/selections.php',
            
            data: {
                action: 'add_search_entry',
                user_id: this.userId,
                query: listItem.get('title')
            },
            
            success: function( response ) {
                
                if( response.status !== 1 ) {
                    alert( "Error saving playlist. Please try again later." );
                    return;
                }

                listItem.set( {id: response.data} );
                SelectionsApp.DefaultCollection.Searches.add( listItem, { at: 0, select: true } );
            }
        });
    },
	
    deleteSearchEntry: function( listItem )
    {
        this.ajaxPostJson({
            
            url: '/resource/selections.php',
            
            data: {
                action: 'delete_search_entry',
                user_id: this.userId,
                id: listItem.id
            },
            
            success: function( response ) {
                
                if( response.status !== 1 ) {
                    alert( "Error saving playlist. Please try again later." );
                    return;
                }
                
				
                SelectionsApp.DefaultCollection.Searches.remove( listItem );

                if( SelectionsApp.DefaultCollection.Searches.size() === 0 ) {
                    SelectionsApp.Content.showEmptyListContent();
                }    
            }
        });
    },  		
             
	
    ajaxPostJson: function( settings )
    {
        $.ajax({
            url: settings.url,
            type: 'POST',
            data: settings.data,
			cache: false,
            dataType: "json",
            success: function( response ) {
                
                if( response && response.success === '-1' ) {                    
                    alert( "Error: " + response.errorMessage );                
                } else if( settings.success ) {
                    settings.success( response );
                }
            
            },
            
            failure: settings.failure
        });     
                
    }	
	
});
