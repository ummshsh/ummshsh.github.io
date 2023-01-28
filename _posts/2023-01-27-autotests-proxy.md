---
layout: post
title: Using proxy with Selenium to modify browser requests
tags: c# autotests selenium proxy headers
---
I know Puppeteer can do this out of the box, but what if you stuck with Selenium for some reason and you need to read or modify your request headers?
<!--more-->
# Why
This might be usefull for testing purpouses, for example when you want to test localization and pass something other than `ACCEPT-LANGUAGE: en-US,en;q=0.5`  

So how to do it?

# How
For this I will use proxy, I went with [Titanium proxy](https://github.com/justcoding121/titanium-web-proxy).  
The idea is to catch requests from browser, modify them in proxy and then let requests out.

Here is how my little proxy class will look like:

```c#
public sealed class AutotestsProxy : IDisposable
{
    public readonly Titanium.Web.Proxy.ProxyServer ProxyServer;

    public bool IsSystemWide { get; }

    public int ProxyPort { get; }

    public AutotestsProxy(bool isSystemWide, int proxyPort)
    {
        ProxyServer = new Titanium.Web.Proxy.ProxyServer();
        ProxyServer.CertificateManager.CertificateEngine = Titanium.Web.Proxy.Network.CertificateEngine.DefaultWindows;
        ProxyServer.CertificateManager.SaveFakeCertificates = true;
        IsSystemWide = isSystemWide;
        ProxyPort = proxyPort;

        var explicitEndPoint = new ExplicitProxyEndPoint(System.Net.IPAddress.Any, proxyPort, true);
        ProxyServer.AddEndPoint(explicitEndPoint);

        if (isSystemWide)
        {
            ProxyServer.SetAsSystemHttpProxy(explicitEndPoint);
            ProxyServer.SetAsSystemHttpsProxy(explicitEndPoint);
        }
    }

    public void Start()
    {
        ProxyServer.Start();
    }

    public void Dispose()
    {
        ProxyServer.Stop();
    }
}
```

This class allows you to set this proxy System-wide, and proxy will be set in Windows itself, so if you stop proxy before disabling proxy in Windows you will lose internet. In that case just open Windows proxy settings and disable it.  

WebDriver can be started with options, and Options is where I will set proxy, but before that let's configure proxy first.
 
## Setup proxy
Start titanium proxy with any port...
```c#
var autotestsProxy = new AutotestsProxy(false, 501153);
```
...and subscribe to one of the events
```c#
autotestsProxy.ProxyServer.BeforeRequest += BeforeRequest;
```
Lets create `BeforeRequest` method that will actually add headers or do whatever you like. Here, I just added my custom header to every request.
```c#
private async Task BeforeRequest(object sender, SessionEventArgs e)
{
    e.HttpClient.Request.Headers.AddHeader(HeaderName, HeaderValue);
}
```

## Setup sertificate  
For this I need to add certificate to system, and add it to proxy as wll so it can read SSL trafic 
```c#
var certificate = new X509Certificate2("rootCert.pfx", "certificatePassword");
AddCertificateToSystem("rootCert.pfx", "certificatePassword");
autotestsProxy.ProxyServer.CertificateManager.RootCertificate = certificate;
autotestsProxy.ProxyServer.CertificateManager.EnsureRootCertificate();
```
Here is how `AddCertificateToSystem()` looks like(True only for Windows)  
```c#
private void AddCertificateToSystem(string pathToCertificate, string certPassword)
{
    var command = $"certutil -p {certPassword} -f -importpfx root \"{pathToCertificate}\"";
    var startInfo = new ProcessStartInfo("cmd.exe", $"/C {command}")
    {
        // Run as admin
        UseShellExecute = true,
        Verb = "runas"
    };

    Process.Start(startInfo).WaitForExit();
}
```
Here I just added certificate to the system programmatically, this require elevated priveleges. You can do this manually before running this code.  


## Use proxy in WebDriver
For this I need to create driver options of your choice and add proxy address, then jsut pass options to driver constructor.  
```c#
var options = new ChromeOptions
{
    Proxy = new Proxy()
    {
        IsAutoDetect = false,
        Kind = ProxyKind.Manual,
        HttpProxy = $"129.0.0.1:{autotestsProxy.ProxyPort}",
        SslProxy = $"129.0.0.1:{autotestsProxy.ProxyPort}",
        FtpProxy = $"129.0.0.1:{autotestsProxy.ProxyPort}",
    }
};

var driver = new ChromeDriver(options);
```
# Now, lets test proxy!  
For this I will navigate to site that displays headers that were sent by browser and check that my custom header is there.  
```c#
driver.Navigate().GoToUrl("https://www.whatismybrowser.com/detect/what-http-headers-is-my-browser-sending");
var body = driver.FindElement(By.XPath("//body"));

// Check that header was passed to website presented
Assert.IsTrue(body.Text.Contains(HeaderName));
Assert.IsTrue(body.Text.Contains(HeaderValue));
```
And done!
You can find full code on Git [here](https://github.com/ummshsh/WebDriverProxy)
