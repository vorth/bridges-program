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

    const schedule = doc.querySelector( 'main .entry-content' );
    const newDay = (text) => {
      const today = document.createElement( 'div' );
      today.classList.add( 'day', 'toggle' );
      const intro = document.createElement( 'div' );
      intro.textContent = text;
      intro.classList.add( 'day-heading' );
      intro.addEventListener( 'click', toggleOpen );
      today.appendChild( intro );
      const sessions = document.createElement( 'div' );
      sessions.classList.add( 'sessions' );
      today.appendChild( sessions );
      return today;
    }
    const toggleOpen = evt => {
      evt.stopPropagation();
      const thisToggle = evt.target.closest( '.toggle' );
      const toggles = document.querySelectorAll( '.toggle' );
      for ( const toggle of toggles ) {
        if ( toggle !== thisToggle )
          toggle.classList.remove( 'open' );
      }
      thisToggle.classList .toggle( 'open' );
    }
    document.getElementById( 'about' ) .addEventListener( 'click', toggleOpen );

    let parallel = null;
    const newParallelSession = () => {
      const parallel = document.createElement('div');
      parallel.classList.add('parallel');
      const intro = document.createElement('div');
      intro.textContent = 'Parallel Tracks';

      // Navigation buttons
      const nav = document.createElement('div');
      nav.classList.add('track-nav');
      const leftBtn = document.createElement('button');
      leftBtn.innerHTML = '◀';
      leftBtn.className = 'track-left';
      const rightBtn = document.createElement('button');
      rightBtn.innerHTML = '▶';
      rightBtn.className = 'track-right';
      nav.appendChild(leftBtn);
      nav.appendChild(intro);
      nav.appendChild(rightBtn);
      parallel.appendChild(nav);

      const tracks = document.createElement('div');
      tracks.classList.add('tracks');
      parallel.appendChild(tracks);


      // Track navigation logic
      let current = 0;
      leftBtn.addEventListener('click', e => {
        e.stopPropagation();
        // showTrack(current - 1, -1);
      });
      rightBtn.addEventListener('click', e => {
        e.stopPropagation();
        // showTrack(current + 1, 1);
      });

      // Initial state
      setTimeout(() => {
        // updateTracksMinHeight();
        // showTrack(0, 0);
      }, 0);

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
        parallel = parallel.querySelector( '.tracks' ); // tracks
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