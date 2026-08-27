using FreeCryptoNews;

var client = new CryptoNews();

Console.WriteLine("=== Latest Crypto News ===");
var articles = await client.GetLatestAsync(5);
foreach (var a in articles)
    Console.WriteLine(a);

Console.WriteLine("\n=== Bitcoin News ===");
var btc = await client.GetBitcoinAsync(3);
foreach (var a in btc)
    Console.WriteLine(a);

Console.WriteLine("\n=== Search: ethereum ===");
var results = await client.SearchAsync("ethereum", 3);
foreach (var a in results)
    Console.WriteLine(a);
