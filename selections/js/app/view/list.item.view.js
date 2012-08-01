/**
 * The individual list item view.
 * 
 * Provides ability to respond to list item selections
 * and also dictates whether list items are one or two
 * rows.
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.ListItemView = Backbone.View.extend({
    
    tagName: "li",
    
    className: "list-item",

    events: {
       "click" : "select"
    },

    initialize: function( args )
    {
        this.isSingleLine = args.singleLine;
    },
                              

    //-------------------------------------------------------------------------
    // Render Routines
    //-------------------------------------------------------------------------
    
    render: function()
    {
        if( this.isSingleLine ) {
            this.$el.html( this.oneLineTemplate( this.model.toJSON() ) );
        } else {
            this.$el.html( this.twoLineTemplate( this.model.toJSON() ) );
        }       
        
        if( this.isSelected ) {
            this.$el.addClass( "selected" );
        }
        
        return this;
    },
    

    //-------------------------------------------------------------------------
    // List Item Manipulation Routines
    //-------------------------------------------------------------------------

    setSelected: function( selected )
    {
        if( selected ){
            this.$el.addClass( "selected" );
        } else {
            this.$el.removeClass( "selected" );
        }
    },
    
    select: function()
    {
        if( SelectionsApp.Content.selectedListItemView ) {
            SelectionsApp.Content.selectedListItemView.setSelected( false );
        }

        SelectionsApp.Content.selectedListItemView = this;

        this.setSelected( true );  
        
        this.model.trigger( 'select', this.model );
    },
    
    

    //-------------------------------------------------------------------------
    // Templates for list item UI
    //-------------------------------------------------------------------------
    
    oneLineTemplate: _.template( "<div class='list-item-title'><%= title %></div>" ),
    
    twoLineTemplate: _.template( "<div class='list-item-title'><%= title %></div>" +
                                 "<div class='list-item-description'><%= description %></div>" )
                                        
});
