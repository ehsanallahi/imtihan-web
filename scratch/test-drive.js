(async () => {
  const url = 'https://drive.google.com/uc?export=download&id=11vYjUXTwshemtoHri1GoTHtjmPz9t1KZ';
  let r = await fetch(url);
  let text = await r.text();
  console.log("Status:", r.status);
  console.log("Headers:", Array.from(r.headers.entries()));
  
  const uuidMatch = text.match(/confirm=([a-zA-Z0-9_-]+)/);
  if(uuidMatch) console.log("UUID:", uuidMatch[1]);
  
  const uuidMatch2 = text.match(/uuid-([a-zA-Z0-9-]+)/);
  if (uuidMatch2) console.log("UUID2:", uuidMatch2[1]);
  
  console.log(text.substring(0, 1000));
})();
