/**
 * The Track Collection definition for SoundCloud Selections.
 * 
 * This collection governs the SoundCloud track content in the app. 
 * This track collection are based on existing data like user
 * playlists as well as dynamic data like search queries for
 * SoundCloud.
 * 
 * Convenience methods for adding event listeners are also
 * exposed. It is preferred for event listeners to be bound
 * to the collection rather than individual models.
 * 
 * @author Kalu Kalu
 * @since  July 29, 2012
 */

SelectionsApp.TrackCollection = Backbone.Collection.extend({
    
    model: SelectionsApp.TrackModel,
    
    addInsertListener: function( callback )
    {
        this.on( 'add', callback );
    },
    
    addRemoveListener: function( callback )
    {
        this.on( 'remove', callback );
    },
    
    addRefreshListener: function( callback )
    {
        this.on( 'refresh', callback );
    },      
    
    containsTrackId: function( trackId )
    {
        var track = this.get( trackId );        
        return track ? true : false;
    }   
            
});