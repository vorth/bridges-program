
const isDaySeparator = node => node.tagName === 'H4';

const isTrack = node => {
  const text = node.textContent.trim();
  return text.startsWith( '14:00–15:' ) || text.startsWith( '16:00–17:' );
}


fetch( './official-program.html' )
  .then( response => response.text() )
  .then( text => {
    const parser = new DOMParser();
    const doc = parser.parseFromString( text, 'text/html' );

    const mainContent = doc.querySelector( 'main' );

    const sessions = mainContent.querySelectorAll( '.sched_block' );
    for ( const session of sessions ) {
      const title = session.querySelector( 'p' );
      if ( !!title ) {
        console.log( title.textContent );
      }
    }

    const schedule = doc.querySelector( 'main .entry-content' );
    const newDay = (text) => {
      const today = document.createElement( 'div' );
      today.classList.add( 'day', 'toggle' );
      const intro = document.createElement( 'span' );
      intro.textContent = text;
      intro.classList.add( 'day-heading' );
      today.addEventListener( 'click', toggleOpen );
      today.appendChild( intro );
      const sessions = document.createElement( 'div' );
      sessions.classList.add( 'sessions' );
      today.appendChild( sessions );
      return today;
    }
    const toggleOpen = evt => {
      evt.stopPropagation();
      const classlist = evt.target.closest( '.toggle' ).classList;
      classlist .toggle( 'open' );
    }
    document.getElementById( 'about' ) .addEventListener( 'click', toggleOpen );

    let parallel = null;
    const newParallelSession = () => {
      const parallel = document.createElement( 'div' );
      parallel.classList.add( 'parallel', 'toggle' );
      const intro = document.createElement( 'span' );
      intro.textContent = 'Parallel Tracks';
      intro.classList.add( 'day-heading' );
      parallel.addEventListener( 'click', toggleOpen );
      parallel.appendChild( intro );
      const tracks = document.createElement( 'div' );
      tracks.classList.add( 'tracks' );
      parallel.appendChild( tracks );
      return parallel;
    }

    let child = schedule.firstElementChild.nextElementSibling; // skip the style element
    const next = child.nextElementSibling;

    let day = newDay( 'General Information' );
    schedule.replaceChild( day, child );
    day = day.firstElementChild.nextElementSibling; // sessions
    day.appendChild( child );
    child = next;

    while ( child ) {
      const next = child.nextElementSibling;

      if ( isDaySeparator( child ) )
      {
        day = newDay( child.textContent.trim() );
        schedule.replaceChild( day, child );
        day = day.firstElementChild.nextElementSibling; // sessions
      }
      else if ( parallel===null && isTrack( child ) )
      {
        // start parallel tracks
        parallel = newParallelSession();
        day.appendChild( parallel );
        parallel = parallel.firstElementChild.nextElementSibling; // tracks
        parallel.appendChild( child );
      }
      else if ( parallel!==null && !isTrack(child) )
      {
        // end parallel tracks
        day.appendChild( child );
        parallel = null;
      }
      else if ( parallel!==null )
      {
        // add to parallel tracks
        parallel.appendChild( child );
      }
      else
      {
        day.appendChild( child );
      }
      child = next;
    }


    document.body.appendChild( mainContent );
  } );