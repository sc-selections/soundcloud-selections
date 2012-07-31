/**
 * The individual track item view.
 * 
 * - Allows for pause / play by clicking on the track.
 * - Allows for insertion / removal to the live playlist.
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.TrackItemView = Backbone.View.extend({
    
    tagName: "li",
    
    className: "item-entry",

    events: {
       "click" : "togglePlayState",
	   "click .item-entry-remove" : "removeTrackFromLivePlaylist",
       "click .item-entry-add" : "addTrackToLivePlaylist"
    },

    initialize: function( args )
    {
		this.type = args.type;
		this.index = args.index + 1;
		
		// ensure the indexes less than are prefixed with 0 		
	    this.index = this.index < 10 ? '0' + this.index : this.index;
    },
                              
    render: function()
    {
		var isLivePlaylistTrack,
		    track,
			trackData,
		    template;
		
		track = this.model;

        // Select the template for representing tracks.
		// Note: All non-user playlist tracks can be added at any time.
		
		switch( this.type ) {
			
			case 'playlist':
			    template = this.playlistTemplate;
			    break;
			
            default:
			    isLivePlaylistTrack = SelectionsApp.Content.isLivePlaylistTrack( track );			
				template = isLivePlaylistTrack ? this.removeTrackTemplate : this.addTrackTemplate;
                break;
		}
		
		// Render the view
		trackData = track.toJSON();
		trackData.index = this.index;         
        this.$el.html( template( trackData ) );      
		
		
		// Check if this track is playing & update UI
		if( SelectionsApp.Player.getCurrentTrack() === track ) {

			this.$el.addClass( "selected" );
			
			if( SelectionsApp.Player.isPlaying() ) {
                this.$el.removeClass( "pause" );
				this.$el.addClass( "play" );				
			} else {
                this.$el.removeClass( "play" );
                this.$el.addClass( "pause" );                
		    }
			            
		}
        
        return this;
    },
    
    setSelected: function( selected )
    {
        if( selected ){
            this.$el.addClass( "selected" );
        } else {
            this.$el.removeClass( "selected" );
            this.$el.removeClass( "pause" );
            this.$el.removeClass( "play" );			
        }
    },
	
    select: function()
    {
        if( SelectionsApp.Content.selectedTrackItem ) {
            SelectionsApp.Content.selectedTrackItem.setSelected( false );
        }

        SelectionsApp.Content.selectedTrackItem = this;

        this.setSelected( true );  
        
        this.model.trigger( 'select', this.model );
    },      	
    
	playTrack: function()
	{		
		if( SelectionsApp.Player.playTrack( this.model ) ) {
	        this.$el.removeClass( "pause" );
	        this.$el.addClass( "play" );			
		}		
	},
	
    pauseTrack: function()
    {
		if( SelectionsApp.Player.pauseTrack() ) {
	        this.$el.removeClass( "play" );
	        this.$el.addClass( "pause" );			
		}
    },
	
    resumeTrack: function()
    {
        if( SelectionsApp.Player.resumeTrack() ) {
            this.$el.removeClass( "pause" );
            this.$el.addClass( "play" );            
        }
    },	
	
	stopTrack: function()
	{        
		if( SelectionsApp.Player.stopTrack() ) {
	        this.$el.removeClass( "pause" );
	        this.$el.removeClass( "play" );			
		}		
	},
		
    togglePlayState: function()
    {
		var paused;
		
        if( SelectionsApp.Content.selectedTrackItem === this ) {
			
			paused = SelectionsApp.Player.isPaused();
			
			if( paused ) {
			    this.resumeTrack();
			} else {
				this.pauseTrack();
			}
			
            return;
        }
        
        if( SelectionsApp.Content.selectedTrackItem ) {
			SelectionsApp.Content.selectedTrackItem.stopTrack();
            SelectionsApp.Content.selectedTrackItem.setSelected( false );
        }
        
        this.setSelected( true );
        SelectionsApp.Content.selectedTrackItem = this;
		
        this.playTrack();       
    },
	
    addTrackToLivePlaylist: function( event ) 
    {
		var track = this.model;
		
		SelectionsApp.Content.addLivePlaylistTrack( track );
		event.stopPropagation();
		
        track.trigger( 'refresh', track );      
    },   

	removeTrackFromLivePlaylist: function( event ) 
	{
		var track,
		    verifyRemove,
		    isLivePlaylistTrack,
			isLivePlaylistActive;
		
		track = this.model;
				
        isLivePlaylistTrack = SelectionsApp.Content.isLivePlaylistTrack( track );
		isLivePlaylistActive = SelectionsApp.Content.isLivePlaylistActive();
		
		if( isLivePlaylistTrack && !isLivePlaylistActive ) {
			
            SelectionsApp.Content.removeLivePlaylistTrack( track );
			track.trigger( 'refresh', track );
			
		} else if( isLivePlaylistActive ) {
			
            SelectionsApp.Content.removeLivePlaylistTrack( track );
			
		} else {

            verifyRemove = confirm( "Remove track from this playlist?" );
            
            if( verifyRemove ) {
                SelectionsApp.Request.removePlaylistTrack( track );
            }
		}
		
		event.stopPropagation();
	},
	
	
	
	// Templates for Track Item View
	
    playlistTemplate: _.template( "<div class='item-entry-actions edit-action'>" +
                                      "<img class='item-entry-remove' src='/img/remove.png' title='Remove Track' alt='remove'/>" +
                                  "</div>" +
                                  "<div class='item-entry-play'></div>" +
                                  "<div class='item-entry-index'><%= index %></div>" +
                                  "<div class='item-entry-info'>" +                               
                                      "<div class='item-entry-title'><%= title %></div>" +
                                      "<div class='item-entry-description'><%= description %></div>" +
                                  "</div>" ),
								  
    removeTrackTemplate: _.template( "<div class='item-entry-actions'>" +
                                      "<img class='item-entry-remove' src='/img/remove.png' title='Remove Track' alt='remove'/>" +
                                  "</div>" +
                                  "<div class='item-entry-play'></div>" +
                                  "<div class='item-entry-index'><%= index %></div>" +
                                  "<div class='item-entry-info'>" +                               
                                      "<div class='item-entry-title'><%= title %></div>" +
                                      "<div class='item-entry-description'><%= description %></div>" +
                                  "</div>" ),
								  
    addTrackTemplate: _.template( "<div class='item-entry-actions default-action'>" +
                                      "<img class='item-entry-add' src='/img/add.png' title='Add Track' alt='add'/>" +
                                  "</div>" +
                                  "<div class='item-entry-play'></div>" +
                                  "<div class='item-entry-index'><%= index %></div>" +
                                  "<div class='item-entry-info'>" +                               
                                      "<div class='item-entry-title'><%= title %></div>" +
                                      "<div class='item-entry-description'><%= description %></div>" +
                                  "</div>" )
        
});
