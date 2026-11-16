// Both languages are in the HTML; globals.css hides the one that isn't chosen
// (html[data-lang]). So pages stay static and nothing flashes on load.
export function T({ ur, en }) {
  return (
    <>
      <span data-l="ur" lang="ur">{ur}</span>
      <span data-l="en" lang="en">{en}</span>
    </>
  );
}

/** Runs before first paint: marks that scripts work (for scroll reveals) and applies the saved language. */
export const langScript = `document.documentElement.dataset.js="1";try{if(localStorage.getItem("lang")==="ur"){var d=document.documentElement;d.lang="ur";d.dir="rtl";d.dataset.lang="ur"}}catch(e){}`;
