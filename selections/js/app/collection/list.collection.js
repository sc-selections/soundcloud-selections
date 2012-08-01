/**
 * The List Collection definition for SoundCloud Selections.
 * 
 * This collection governs the lists that are available in
 * the app. This includes user playlists, music selections, 
 * music genres, and search history entries.
 * 
 * These collections are also used to manage dynamic list
 * entries like Now Playing and Live Playlist.
 * 
 * Convenience methods for adding event listeners are also
 * exposed. It is preferred for event listeners to be bound
 * to the collection rather than individual models.
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.ListCollection = Backbone.Collection.extend({
    
    model: SelectionsApp.ListModel,

    addSelectListener: function( callback )
    {
        this.on( 'select', callback );
    },
    
    addInsertListener: function( callback )
    {
        this.on( 'add', callback );
    },
    
    addRemoveListener: function( callback )
    {
        this.on( 'remove', callback );
    },

    addChangeListener: function( callback )
    {
        this.on( 'change', callback );
    },
    
    addRefreshListener: function( callback )
    {
        this.on( 'refresh', callback );
    }   
        
});