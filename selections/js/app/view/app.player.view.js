/** The Player Request view / controller.
 * 
 *  This controller provides the facilities for the UI to
 *  play tracks and automatically play the next track.
 *  
 *  Also includes support for requests to create / edit
 *  playlists.
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.PlayerView = Backbone.View.extend({
    
    initialize: function()
    {
        // Setup the Now Playing list entry item and 
        // hook up the selection listener
        
        this.nowPlayingList = new SelectionsApp.ListModel({
            title: "Now Playing",
            description: "Currently Playing Tracklist"
        });
        
        this.nowPlayingTrackCollection = new SelectionsApp.ListCollection();
        this.nowPlayingList.addSelectListener( this.onNowPlayingSelect );
    },
    
    getCurrentTimestamp: function() 
    {
        return this.currentTrackPlaying ? this.trackPosition + ' / ' + this.trackDuration : '';
    },
    
    stopTrack: function()
    {
        var trackSound;
        
        if( this.currentTrackPlaying ) {
            trackSound = this.currentTrackPlaying.get( 'sound' );            
            trackSound.stop();
            trackSound.unload();
            
            this.currentTrackPlaying.set( {sound: null} );
            this.currentTrackPlaying = null;
            
            this.updateNowPlayingPlaylist();
            
            return true;        
        }
        
        return false;        
    },

    pauseTrack: function()
    {
        var trackSound;
        
        if( this.currentTrackPlaying ) {
            trackSound = this.currentTrackPlaying.get( 'sound' );            
            trackSound.pause();
            
            // Refresh the UI 
            SelectionsApp.Content.updateTrack( this.currentTrackPlaying );
            SelectionsApp.Content.updateHeader();
            
            return true;        
        }
        
        return false;        
    },
            
    resumeTrack: function()
    {
        var trackSound;
        
        if( this.currentTrackPlaying ) {
            trackSound = this.currentTrackPlaying.get( 'sound' );            
            trackSound.play();

            // Refresh the UI 
            SelectionsApp.Content.updateTrack( this.currentTrackPlaying );
            SelectionsApp.Content.updateHeader();           
            
            return true;        
        }
        
        return false;    
    },
    
    isPaused: function()
    {
        var trackSound,
            paused = false;
        
        if( this.currentTrackPlaying ) {
            trackSound = this.currentTrackPlaying.get( 'sound' );
            
            if( trackSound ) {
                paused = trackSound.playState === 1 && trackSound.paused;           
            }           
        }
        
        return paused;
    },
    
    play: function()
    {
        var trackCollection = SelectionsApp.Content.getCurrentTrackCollection();
        
        if( trackCollection.size() > 0 ) {
            
            this.playTrack( trackCollection.at( 0 ) );
                            
        } else {
            
            alert( "There are no tracks available for playback." );
            return false;
            
        }   
        
        return true;        
    },  
    
    playTrack: function( track )
    {       
        var contentView,
            trackCollection,
            trackSound;

        if( !track ) {
            return false;
        }       
        
        trackCollection = SelectionsApp.Content.getCurrentTrackCollection();
        
        // Only update the player's TrackCollection when required       
        if( this.currentTrackCollection !== trackCollection && this.nowPlayingTrackCollection !== trackCollection ) {
            this.nowPlayingTrackCollection.reset();
            this.nowPlayingTrackCollection.add( trackCollection.models );
            this.currentTrackCollection = trackCollection;
        }
        
        this.trackPosition = '0:00';
        this.trackDuration = '0:00';
        
        this.stopTrack();
        this.currentTrackPlaying = this.nowPlayingTrackCollection.get( track.id );
        
        contentView = this;
        
        
        // fetch the SoundCloud stream url for the track and
        // hook up callbacks
        
        SC.stream("/tracks/" + track.id, 
            
            { whileplaying: contentView.onWhileSoundPlaying,
              onfinish: contentView.onSoundFinished,
              onfailure: contentView.onSoundFinished
            },
            
            function( soundObject ) {
                
                if( contentView.currentTrackPlaying.id === track.id ) {
                    
                    contentView.currentTrackPlaying.set( {sound: soundObject } );
                    soundObject.play();
                    
                } else {
                    
                    soundObject.unload();
                }
            }
        );
        

        // Refresh the UI 
        this.updateNowPlayingPlaylist();
        
        SelectionsApp.Content.updateHeader();
        SelectionsApp.Content.updateTrack( this.currentTrackPlaying );
        
        return true;        
    },
    
    playNextTrack: function()
    {        
        var index,
            collection,
            currentTrack,
            nextTrack;


        currentTrack = this.getCurrentTrack();
        
        collection = this.getNowPlayingTrackCollection();
        index = collection.indexOf( currentTrack );
        
        this.stopTrack();
        
        if( index !== -1 && index < collection.size() - 1 ) {
            nextTrack = collection.at( index + 1 );
            this.playTrack( nextTrack );
        } else {
            SelectionsApp.Content.updateTrack( currentTrack );
        }       
    },     
    
    updateNowPlayingPlaylist: function()
    {        
        var isSelectedCollection;
        
        if( this.currentTrackPlaying ) {
            isSelectedCollection = SelectionsApp.Content.getCurrentTrackCollection() === this.nowPlayingTrackCollection;
            SelectionsApp.Content.addDynamicPlaylist( this.nowPlayingList, 'list-item-playing', isSelectedCollection );
        }
    }, 
    
    updateTrackPosition: function()
    {
        var currentTrackCollection,
            currentTrackPosition,
            currentTrackDuration,           
            seconds,
            minutes,
            trackSound;
        
        // only update when now playing is in view
        currentTrackCollection = SelectionsApp.Content.getCurrentTrackCollection(); 
        if( currentTrackCollection !== this.currentTrackCollection && 
            currentTrackCollection !== this.nowPlayingTrackCollection ) {
            return;
        }       
        
        trackSound = this.currentTrackPlaying.get( 'sound' );
        
        currentTrackPosition = trackSound.position;
        currentTrackDuration = this.currentTrackPlaying.get('data').duration;
        
        // update position
        minutes = Math.floor( currentTrackPosition / 60000 );
        seconds = Math.floor( ( currentTrackPosition % 60000 ) / 1000 );        
        seconds = ( seconds < 10 ) ? '0' + seconds : seconds;
        currentTrackPosition = minutes + ':' + seconds;
                
        // update duration
        minutes = Math.round( currentTrackDuration / 60000 );
        seconds = Math.round( ( currentTrackDuration % 60000 ) / 1000 );       
        seconds = ( seconds < 10 ) ? '0' + seconds : seconds;
        currentTrackDuration = minutes + ':' + seconds;
        
        if( this.trackPosition !== currentTrackPosition ) {
            this.trackPosition = currentTrackPosition;
            this.trackDuration = currentTrackDuration;
            SelectionsApp.Content.updateTrack( this.currentTrackPlaying );
        }
        
    },
    
    
    
    /* Public Accessor Methods */
    
    isPlaying: function()
    {
        return this.currentTrackPlaying && !this.isPaused() &&!this.isStopped();
    },
    
    isStopped: function()
    {
        var trackSound = this.currentTrackPlaying ? this.currentTrackPlaying.get('sound') : null;       
        return trackSound ? trackSound.playState === 0 : false; 
    },
    
    getCurrentTrack: function()
    {
        return this.currentTrackPlaying;
    },
    
    getNowPlayingList: function()
    {
        return this.nowPlayingList;
    },
    
    getNowPlayingTrackCollection: function()
    {
        return this.nowPlayingTrackCollection;
    },
    
    isTrackCollectionPlaying: function( trackCollection )
    {
        return trackCollection === this.nowPlayingTrackCollection ||
               trackCollection === this.currentTrackCollection;
    },

    
    
    /* Event Listener Callback Routines */
    
    onNowPlayingSelect: function( listModel )
    {
        SelectionsApp.Content.showTracks( listModel );
    },
    
    onWhileSoundPlaying: function()
    {
        SelectionsApp.Player.updateTrackPosition();
    },

    onSoundFinished: function()
    {
        SelectionsApp.Player.playNextTrack();
    }
    
});
