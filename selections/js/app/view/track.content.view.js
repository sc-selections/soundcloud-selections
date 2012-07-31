/** The track content view.
 * 
 *  This view is responsible for rendering the list of tracks
 *  as well as the track header.
 *  
 *  This class also handles rendering empty track data.
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */
 
 SelectionsApp.TrackContentView = Backbone.View.extend({
    
    initialize: function( args )
    {
		this.listModel = args.listModel;
        this.tracks = args.tracks;
		this.type = args.type;
		this.empty = args.empty;
    },
	
	getListModel: function()
	{
		return this.listModel;
	},
            
    render: function()
    {
        var contentView,
		    headerView,
		    trackView,
			numTracks,
			i;
        
        this.renderHeader();

        contentView = this;

        
        // clear existing content      
        this.setElement( $("#item-content") );
        this.$el.html( null );          
        
		
		// Add tracks or handle empty track lists
        if( this.tracks && this.tracks.size() > 0 ) {
            
			numTracks = this.tracks.size();
			
			for( i = 0; i < numTracks; i++ ) {
	            trackView = new SelectionsApp.TrackItemView( { model: this.tracks.at(i), index: i, type: this.type } );
	            contentView.$el.append( trackView.render().el );
			}
			
		 } else if( this.empty ) {
		 	
			this.$el.append( this.emptyTemplate() );
		 	
         } else if( this.emptyBookmark ) {

            this.$el.append( this.emptyBookmarkTemplate() );
		 	
		 } else {
		 	
			this.$el.append( this.loadingTemplate() );
			
		 }

        return this;                
    },
    
    renderHeader: function()
    {
		var headerView = new SelectionsApp.TrackHeaderView( { model: this.listModel, type: this.type } );		
        this.setElement( $("#item-header") );
        this.$el.html( headerView.render().el );		
    },	
	

    refreshHeader: function()
	{
		this.renderHeader();
	},
	
	setEmpty: function( empty )
	{
		if( this.empty !== empty ) {
			this.empty = empty;
			this.render();
		}		
	},
	
    setEmptyBookmark: function( empty )
    {
        if( this.emptyBookmark !== empty ) {
            this.emptyBookmark = empty;
            this.render();
        }       
    },

    setEmptyPlaylists: function( empty )
    {
        if( this.emptyPlaylist !== empty ) {
            this.emptyPlaylist = empty;
            this.render();
        }       
    },

    refreshTrack: function( track, index, select )
    {
        var trackView,
            oldlistItemElement,
            newListItemElement;

        if( !track || ( !index && index !== 0 ) ) {
            return;
        }
        
		// Redraw the track to pickup UI changes
		
		this.setElement( $("#item-content") );
        trackView = new SelectionsApp.TrackItemView( { model: track, index: index, type: this.type } );            
        newListItemElement = trackView.render().el;
        oldlistItemElement = this.$el.children().eq( index );
        
        if( oldlistItemElement ) {
            $(oldlistItemElement).replaceWith( newListItemElement );
        }
		
		if( select ) {
			trackView.select();
		}
    },	
	
    addTrack: function( track, clear )
    {
        var trackView,
		    size;
		
	    size = SelectionsApp.Content.getCurrentTrackCollection().size();
        trackView = new SelectionsApp.TrackItemView( { model: track, index: size-1, type: this.type } );
		
		this.setElement( $("#item-content") );
		
		if( clear ) {
			this.$el.html( null );
		}
		
		this.$el.append( trackView.render().el );
		
        return trackView;
    },	

    removeTrack: function( index )
    {
        var listItemElement = this.$el.children().eq( index );
        if( listItemElement && listItemElement.size() > 0 ) {
            
            $(listItemElement).remove();
            
        }
    },
	
    close: function()
    {
      this.remove();
      this.unbind();
	  SelectionsApp.Content.selectedTrackItem = null;
    },
	
	
    // Templates for Track Content View
	
    loadingTemplate: _.template( "<div id='item-loading'>Loading...</div>" ),
    
    emptyTemplate: _.template( "<div id='item-empty'><p>No Tracks Found.</p> <p>Explore Selections, Genres, or Search to find new tracks.</p></div>" ),
	
	emptyBookmarkTemplate: _.template( "<div id='item-empty'><p>No Bookmarks Found.</p></div>" ),
	
    emptyPlaylistTemplate: _.template( "<div id='item-empty'><p>Click Add to begin creating a new Playlist.</p></div>" )
    
});
