/**
 * The list header view.
 * 
 * Provides ability to respond to list item selections
 * and also dictates whether list items are one or two
 * rows.
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.ListHeaderView = Backbone.View.extend({
    
    tagName: "div",
    
    id: "list-header-content",

    events: {
       "click #list-add-button" : "addListItem",
       "keypress #list-add-input" : "addListItemOnEnter"
    },    
						       
    initialize: function( args )
    {
        this.type = args.type;
    },
                              
    render: function()
    {
		
		// Select the appropriate template to render the content
		
		switch( this.type ) {
			
			case 'playlist':
                this.$el.html( this.addItemTemplate( { title: "My Playlists", buttonText: 'Add'}) );      
			    break;
            
			case 'selection':
                this.$el.html( this.readOnlyTemplate( { title: "Selections" }) );      
                break;
							
            case 'genre':
                this.$el.html( this.readOnlyTemplate( { title: "Genres" }) );      
                break;
				
            case 'search':
                this.$el.html( this.addItemTemplate( { title: "Search", buttonText: 'Search'}) );      
                break;
				
            case 'bookmark':
                this.$el.html( this.bookmarkTemplate( { 
				    title: "Bookmarks", 
					description: SelectionsApp.Config.getBookmarkletDescription(),
					link: SelectionsApp.Config.getBookmarkletLink()
				}) );      
                break;
		}

        return this;
    },
	
    addListItem: function()
    {
        var title,
		    input,
            listModel;
        
		input = $('#list-add-input');
        title = input.val();
		
        if( !title ) {
            alert( "Please enter a title for your playlist." );
            return;
        }       
        
		
		// Items can only be added for search and playlists.
		
		switch( this.type ) {
			
			
			case 'playlist':
                listModel = new SelectionsApp.ListModel( { title: title, description: "My New Playlist" } );
				SelectionsApp.Request.addPlaylist( listModel );
				break;
			
			case 'search':
                listModel = new SelectionsApp.ListModel( { title: title } );
				SelectionsApp.Request.addSearchEntry( listModel );
                break;
			
		}
        
		input.val( null );
    },
    
    addListItemOnEnter: function( e )   
    {
        if( e.which === 13 ) {
            this.addListItem();
        }
    },
	

    // Templates for List Header View

    addItemTemplate: _.template( "<div id='list-header-title'><%= title %></div>" +
                                 "<div id='list-input'>" +
                                     "<input id='list-add-input' type='text' name='name'>" +
                                     "<div id='list-add-button' class='button'><%= buttonText %></div>" +
                                 "</div>" ),    

    bookmarkTemplate: _.template( "<div id='list-header-title'><%= title %></div>" +	    
                                  "<div id='list-header-info'>" +
								      "<div id='list-header-description'><%= description %></div>" + 
                                      "<a id='list-header-bookmarklet' class='button' href='<%= link %>'>SoundCloud Selections</a></div>" +
								  "</div>" ),

    bookmarkTemplate: _.template( "<div id='list-header-title'><%= title %></div>" +        
                                  "<div id='list-header-info'>" +
                                      "<div id='list-header-description'><%= description %></div>" + 
                                      "<a id='list-header-bookmarklet' class='button' href='<%= link %>'>SoundCloud Selections</a></div>" +
                                  "</div>" ),

								  
    readOnlyTemplate: _.template( "<div id='list-header-title'><%= title %></div>" )
							
});
