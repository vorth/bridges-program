
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
    const newDay = () => {
      const today = document.createElement( 'div' );
      today.classList.add( 'day' );
      return today;
    }
    const toggleDay = evt => evt.target.closest( '.day' ).classList.toggle( 'open' );
    document.getElementById( 'about' ) .addEventListener( 'click', toggleDay );

    const intro = document.createElement( 'h4' );
    intro.textContent = 'General Information';
    let day = newDay();
    intro.addEventListener( 'click', toggleDay );
    day.appendChild( intro );

    const first = schedule.firstElementChild.nextElementSibling; // skip the style element
    let child = first.nextElementSibling;
    schedule.replaceChild( day, first );
    day.appendChild( first );

    while ( child ) {
      const next = child.nextElementSibling;
      if ( child.tagName === 'H4' ) {
        day = newDay();
        child.addEventListener( 'click', toggleDay );
        schedule.replaceChild( day, child );
        day.appendChild( child );
      } else if ( day ) {
        day.appendChild( child );
      }
      child = next;
    }


    document.body.appendChild( mainContent );
  } );