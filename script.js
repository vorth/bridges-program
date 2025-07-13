import { lastBuild } from './timestamp.js';

const isDaySeparator = node => node.tagName === 'H4';

const isTrack = node => {
  const text = node.textContent.trim();
  return text.startsWith( '14:00–15:' ) || text.startsWith( '16:00–17:' );
}

const trackColors = {
  'R': 'blue',   // Regular
  'W': 'green',  // Workshop
  'S': 'pink',   // Short
};


const createProgram = text =>
{
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
  let nav = null;
  let tracks = null;
  let current = 0;
  const newParallelSession = () => {
    const parallel = document.createElement('div');
    parallel.classList.add('parallel');
    const intro = document.createElement('div');
    intro.textContent = 'Parallel Tracks';

    // Navigation buttons
    nav = document.createElement('div');
    nav.classList.add('track-nav');
    nav.appendChild(intro);
    parallel.appendChild(nav);

    tracks = document.createElement('div');
    tracks.classList.add('tracks');
    parallel.appendChild(tracks);

    // Track navigation logic
    current = 0;
    showTrack( tracks, current );

    return parallel;
  }

  const showTrack = (tracks, n) => {
    tracks.style.transform = `translateX(-${n}00%)`;
  }

  const addParallelTrack = (track, current, parallel, nav, tracks, first=false) => {
    parallel.appendChild(track);
    track.classList.add('track');
    const heading = track.querySelector('div p');
    if (heading) {
      // Example: '14:00–15:30: Regular Papers Session 1, Auditorium building, Room X.'
      const match = heading.textContent.match(/: ([A-Z])[a-zA-Z\s]*?(\d+),/);
      if (match) {
        const firstLetter = match[1]; // e.g. "R"
        const lastDigit = match[2];   // e.g. "1"
        const trackButton = document.createElement('button');
        trackButton.innerHTML = `${firstLetter}${lastDigit}`;
        trackButton.className = `track-button has-light-${trackColors[firstLetter]}-background-color`;
        trackButton .addEventListener('click', e => {
          e.stopPropagation();
          showTrack( tracks, current );
          const buttons = nav.querySelectorAll( '.track-button' );
          for ( const button of buttons ) {
            if ( button !== trackButton )
              button.classList.remove( 'selected-track-button' );
          }
          trackButton.classList.toggle( 'selected-track-button' );
        });
        nav.appendChild( trackButton );
        if ( first ) {
          trackButton.classList.add( 'selected-track-button' );
        }
      }
      if (heading.textContent.includes('Regular')) {
        const talks = track.querySelectorAll('li');
        for (const talk of talks) {
          talk.classList.add('regular-talk');
        }
      }
    }
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
      addParallelTrack( child, current, parallel, nav, tracks, true );
      current++;
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
      addParallelTrack( child, current, parallel, nav, tracks )
      current++;
    }
    else
    {
      day.appendChild( child );
    }
    child = next;
  }

  document.body.appendChild( mainContent );

  document.getElementById( 'last-build-time' ).textContent = lastBuild;
}

fetch( './official-program.html' )
  .then( response => response.text() )
  .then( createProgram );