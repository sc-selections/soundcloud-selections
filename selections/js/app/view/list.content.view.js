/** The list content view.
 * 
 *  This view is responsible for rendering the left-column list
 *  items as well as the list item header (which optionally
 *  includes an input field for new items).
 *  
 *  This object also includes support for adding/removing
 *  dynamic playlists (e.g. Now Playing). Dynamic playlists
 *  are not saved across sessions.
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.ListContentView = Backbone.View.extend({
    
    initialize: function( args )
    {
        this.type = args.type;
        this.collection = args.collection;
    },
    
    
    //-------------------------------------------------------------------------
    // Rendering Routines
    //-------------------------------------------------------------------------
    
    render: function()
    {
        var contentView,
            listItemView,
            liveListModel,
            liveTrackCollection,
            singleLine;
        
        if( !this.type || !this.collection ) {
            return;
        }       

        this.renderHeader();    

        contentView = this;
        contentView.setElement( $("#list-content") );

        // All items are single-line rendered except playlists
        isSingleLine = this.type !== 'playlist';
        
        this.collection.forEach( function( playlist ) {
            contentView.addListItem( playlist, isSingleLine );                 
            
        });

        return this;                
    },

    renderHeader: function()
    {
        var headerView = new SelectionsApp.ListHeaderView( { type: this.type } );        
        this.setElement( $("#list-header") );
        this.$el.html( headerView.render().el );        
    },      

    refreshHeader: function()
    {
        this.renderHeader();
    },


    //-------------------------------------------------------------------------
    // List Manipulation Routines
    //-------------------------------------------------------------------------

    addListItem: function( listItem, isSingleLine, index, select )
    {
        var listItemView,
            listItemWrapper,
            listItemElement,
            prevListItemElement;

        listItemView = new SelectionsApp.ListItemView( { model: listItem, singleLine: isSingleLine } );
        listItemElement = listItemView.render().el;
        
        if( !index && index !== 0 ) {
            
            // no index is specified - just append
            this.$el.append( listItemElement );
            
        } else if( index === -1 ) {
            
            // insert to the very first position in the list            
            prevListItemElement = this.$el.children().eq( 0 );
            
            if( prevListItemElement && prevListItemElement.size() > 0  ) {
                prevListItemElement.before( listItemElement );
            } else {
                this.$el.append( listItemElement );
            }                                   
        
        } else {
            
            // insert to the specified position in the list            
            prevListItemElement = this.$el.children().eq( index );

            if( prevListItemElement && prevListItemElement.size() > 0 ) {
                prevListItemElement.after( listItemElement );               
            } else {
                this.$el.append( listItemElement );
            }                                   
            
        }
        
        
        // Select this item if there is not currently a selected item
                     
        if( !SelectionsApp.Content.selectedListItemView ) {
            SelectionsApp.Content.selectedListItemView = listItemView;
            select = true;
        }
        
        if( select ) {          
            this.selectListItem( listItemView, listItemElement );           
        }
        
        return listItemView;
    },
    
    removeListItem: function( index )
    {
        var listItemElement,
            siblingListItemElement;
        
        listItemElement = this.$el.children().eq( index );
        siblingListItemElement = this.$el.children().eq( index + 1 );
        
		if( !siblingListItemElement || siblingListItemElement.size() > 0 ) {
		    siblingListItemElement = this.$el.children().eq( index - 1 );
		}

		
        
        // Remove the specified list item
        if( listItemElement && listItemElement.size() > 0 ) {
            
            $(listItemElement).remove();
            
        }
        
        // Select the closest sibling
        if( siblingListItemElement && siblingListItemElement.size() > 0 ) {
            
            $(siblingListItemElement).click();
            
        }
        
    },
    
    addDynamicPlaylist: function( listItem, className, select )
    {
        var dynamicPlaylistView,
            dynamicPlaylistElement;
        
        if( !listItem ) {
            return;
        }       
        
        this.removeDynamicPlaylist( className );
        
        dynamicPlaylistView = new SelectionsApp.ListItemView( { model: listItem, singleLine: true } );
        dynamicPlaylistElement = dynamicPlaylistView.render().el;
                
        $(dynamicPlaylistElement).addClass( className );
        this.$el.prepend( dynamicPlaylistElement );
        
        if( select ) {
            this.selectListItem( dynamicPlaylistView, dynamicPlaylistElement );
        }
        
        return dynamicPlaylistView;
    },

    removeDynamicPlaylist: function( className, selectSibling )
    {
        var existingPlaylist = this.$el.children( '.' + className );
        if( existingPlaylist && existingPlaylist.size() > 0 ) {
            
            if( selectSibling ) {
                this.removeListItem( $(existingPlaylist).index() );
            } else {
                $(existingPlaylist).remove();
            }
        }
    },
    
    refreshListItem: function( listItem, index )
    {
        var listItemView,
            oldlistItemElement,
            newListItemElement;

        if( !listItem || ( !index && index !== 0 ) ) {
            return;
        }
        
        switch( this.type ) {
            
            case 'playlist':        
                listItemView = new SelectionsApp.ListItemView( { model: listItem } );
                newListItemElement = listItemView.render().el;
                oldlistItemElement = this.$el.children().eq( index );
                
                if( oldlistItemElement ) {
                    $(oldlistItemElement).replaceWith( newListItemElement );
                }
                listItemView.select();
                break;
        }       
    },

    selectListItemByIndex: function( listItemView, index )
    {
        var listItemElement = this.$el.children().eq( index );
        
        if( listItemElement ) {
            this.selectListItem( listItemView, listItemElement );
        }
    },
    
    selectListItem: function( listItemView, listItemElement )
    {
        var listItemWrapper,
            offset;
           
        listItemWrapper = $('#list-wrapper');
        listItemElement = $(listItemElement);
        
        listItemView.select();
                        
        offset = listItemWrapper.scrollTop() + 
                 listItemElement.offset().top + 
                 listItemElement.height() - 
                 listItemWrapper.height();
                     
        if( offset > 0 ) {
        
            $('#list-wrapper').animate({
                scrollTop: offset
            }, 150 );
        }       
        
    },
        
    close: function()
    {
      this.$el.html( null );
      SelectionsApp.Content.selectedListItemView = null;
    }
    
    
});
