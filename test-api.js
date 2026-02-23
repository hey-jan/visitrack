async function testApi() {
  try {
    const res = await fetch('http://localhost:3000/api/attendance/cs-pract41?date=Jan%2010,%202026');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
testApi();
