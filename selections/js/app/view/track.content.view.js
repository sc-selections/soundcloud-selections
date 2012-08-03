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
            
                
    //-------------------------------------------------------------------------
    // Render Routines
    //-------------------------------------------------------------------------

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
        
        
        // Add tracks to UI or handle empty track list
        
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
    

    
    //-------------------------------------------------------------------------
    // Track List Manipulation Routines
    //-------------------------------------------------------------------------
        
    addTrack: function( track, clear )
    {
        var trackView,
            size;
        
        size = SelectionsApp.Content.getCurrentTrackCollection().size();
        trackView = new SelectionsApp.TrackItemView( { model: track, index: size-1, type: this.type } );
        
        this.refreshHeader();

        this.setElement( $("#item-content") );
        
        if( clear ) {
            this.$el.html( null );
        }
        
        this.$el.append( trackView.render().el );
        
        return trackView;
    },  

    removeTrack: function( index )
    {
        var trackItemElement = this.$el.children().eq( index );
        if( trackItemElement && trackItemElement.size() > 0 ) {
            
            $(trackItemElement).remove();
            
        }
    },

    refreshTrack: function( track, index, select )
    {
        var trackView,
            oldtrackItemElement,
            newTrackItemElement;

        if( !track || ( !index && index !== 0 ) ) {
            return;
        }
        
        // Redraw the track to pickup UI changes
        
        this.setElement( $("#item-content") );
        trackView = new SelectionsApp.TrackItemView( { model: track, index: index, type: this.type } );            
        newTrackItemElement = trackView.render().el;
        oldtrackItemElement = this.$el.children().eq( index );
        
        if( oldtrackItemElement ) {
            $(oldtrackItemElement).replaceWith( newTrackItemElement );
        }
        
        if( select ) {
            trackView.select();
        }
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
    
    scrollToTrackIndex: function( index )
    {
        var trackItemElement = this.$el.children().eq( index );
        
        if( trackItemElement ) {
            this.scrollToTrackItem( trackItemElement );
        }
    },
    
    scrollToTrackItem: function( trackItemElement )
    {
        var trackItemWrapper,
            offset;
           
        trackItemWrapper = $('#item-wrapper');
        trackItemElement = $(trackItemElement);
        
        offset = trackItemWrapper.scrollTop() + 
                 trackItemElement.offset().top + 
                 trackItemElement.height() - 
                 trackItemWrapper.height();
                     
        if( offset > 0 ) {
        
            $('#item-wrapper').animate({
                scrollTop: offset
            }, 150 );
        }       
        
    },  
    
    close: function()
    {
      this.remove();
      this.unbind();
      SelectionsApp.Content.selectedTrackItem = null;
    },
    
    
    //-------------------------------------------------------------------------
    // Templates for track list UI
    //-------------------------------------------------------------------------
    
    loadingTemplate: _.template( "<div id='item-loading'>Loading...</div>" ),
    
    emptyTemplate: _.template( "<div id='item-empty'><p>No Tracks Found.</p> <p>Explore Selections, Genres, or Search to find new tracks.</p></div>" ),
    
    emptyBookmarkTemplate: _.template( "<div id='item-empty'><p>No Bookmarks Found.</p></div>" )
    
});
