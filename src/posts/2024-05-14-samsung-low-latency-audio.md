---

title: "Koala sampler on Samsung and low latency audio"
tags: music production c++ android koala samsung
---

This is how I tried to debug "poor" audio quality of `Koala` sampler on my Samsung Android.  
*SPOILER: Just don't buy Samsung.*

<!--more-->
# Koala samler and poor audio quality
It is all started from [Koala sampler](https://www.koalasampler.com/).

![Koala sampler](/assets/images/koala_sampler.jpg)

I was about to do some portable music on my `Samsung S21` and I had high hopes, because I coudn't pull a trigger on `SP404mk2` or `MPC One+` for a long time but still wanted to get away from PC at least while making music. And `Koala` seemed very much capable or doing sampled music as this app was mentioned in every `404` talk. Recent partnership with Roland only proves it. And I also knew it beforehand, I've watched a lot of `SP404` videos and know that they are trading blows with `Koala`.

I played with Koala for a while(bought all extensions) but I found out that this app sounds... very bad.

>Also, don't know how peope endured `SP404` before `SP404mk2` and 4.04 update. As I had all of those new features on my OG `MV-8000` and my friend's `MV-8800` ten years ago. (`8000` and `8800` are the same, just coulurfull screen on the latter). I guess this is a <a class="glitch">lo-fi</a> way.

> On topic of `MV-8000` I would love to have something like this on new hardware with linear arranger.

![Мой Roland MV-8000](/assets/images/mv8000.jpg)

So, the issue was, and it was very frustrating: If you import sample via Koala sample browser or get any sound into Koala somehow(you can record, import video, import from sample browser), then it becomes very degraded in sound quality inside project.
You can just preview sample in browser then load it to pad and it would be immediately worse, I regretted spending my money at a time.

![Koala's sample browser](/assets/images/koala_sample_browser.jpg)

I've spent quite a while debugging and even deleted some projects in the process but then I noticed that actually when I use headphones sound quality was very good in both sample browser and in project on pads. More than that they sounded the same!

Aaand my debugging included but was not limited to:  
- ➡️Disabling Dolby Athmos  
- ➡️Switch to old Android sound API in Koala settings  
- ➡️Switch stuff in phone dev settings  
- ➡️Force system wide mono audio  
- ➡️Clearing storage(this is where I lost some projects, unfortunately)  
- ➡️Restallation (I'm just complaining at this point)  

<br/>

I did what I had to do: I desperately left negative review with one star on google play to get attention from developer =)  
He reached me eventually and turns out he is a great guy and he tried to understand the reasoning for this behaviour in long email thread and even bought his own relatively recent Samsung phone to debug this issue.

> It was [Marek Bereza](https://www.mazbox.com/) is one of the creators of `Koala` sampler, or original creator, I don't know really for sure who is who and don't want to offend anyone.

He had a couple of ideas right of the bat, but ultimately one caught my attention:   
**Maybe Samsung phones have their own software sound processing to make full use of hardware onboard. But it is not really low level processing and it kicks in only if you are using regular Android audio capabilites, and low latency API seem to bypass this and phone speakers work without this software manufacturer tuning in case of low latency API.**
🤯

So, in my mind it looks like this:

|Sound playback|Sound playback|
|---|---|
|↓|↓|
|Using speakers🔊|Using speakers🔊|
|↓|↓|
|Using regular Android sound API's(Audio players, media, system sounds)|Using Low latecy API. For example using Oboe library|
|↓|↓|
|Samsung additional software processing ✅| Bypassed directly to speaker drivers ❌|
|↓|↓|
|`Enhanced sound` but with latency not appropriate for music applications|Low latency `audio without enhancements, that sounds bad` because manufacturer enhancment was bypassed|

# Testing idea using Oboe low latecy audio library
#### Test 1
I checked this asumption in table just by listening =) And this is what we hear in reality.   
In table above when I say `enhanced sound` I mean: more stereo, louder, more full sound. This is how I used to hear my phone.  
And when I say that `audio without enhancements, that sounds bad` I mean: It sounds bad comparatively to processed sound, as I used my phone majority of time with this processing applied.

#### Test 2
Then I performed another check using `Oboe`.  
> Why `Oboe` is low latency API you can check in this talk [Don Turner - Winning on Android](https://youtu.be/tWBojmBpS74) from 5 years ago =). But here is `why` in one slide from this talk:
![Oboe api's description](/assets/images/oboe_apis.png)

There is an examples folder in `Oboe` library for low latency applications in [Oboe git](https://github.com/google/oboe/blob/main/samples/hello-oboe/README.md). I used [drumthumper](https://github.com/google/oboe/tree/main/samples/drumthumper) to check if my drum breaks will sound as bad as Koala does using low latecy API.
What I've done is... not much, but it's a honest work =) 

This was 5 min work just to check how it sounds:
1. I've built [drumthumper](https://github.com/google/oboe/tree/main/samples/drumthumper) with my own sounds of drum breaks and installed on my phone 
![DrumThumper application, screen from emulator](/assets/images/DrumThumper.png)
2. I've uploaded same drum breaks files that I used in application to my phone separately
3. Had a listen and results are the same: `Files played through app(low latency) sounds terrible like Koala, same files played through any player on my phone sound miles better`.

#### Test 3
Also, I think a solid proof by itslef is that when you export whatever you have from `Koala` as audio, then it is also sounds good(or maybe i should say `ENHANCED`) without headphones in any audio player. Which is expected at this point, after export we are playing back file with whatever player we have and not using low-latency APIs.


It seems that initial idea is correct and all low-latency apps will sound bad on my phone.

# Headphones
The one thing I didn't mentioned so far is why in headphones everything sounds good.
Because unlike phone speakers headphones characteristics are not constant and can be anything from cheap to very good, so phone is not applying any kind of processing in case when you are using heaphones(unknown device essentially).

This is tested:
- ➡️In Koala: In app `embedded sample browser and on pad sound same in headphones`
- ➡️In my own build of [drumthumper](https://github.com/google/oboe/tree/main/samples/drumthumper): `files played with any audio player sounds the same as this sample low-latency application while using headphones`.

<br/>
So table actually looks like this: 

|Sound playback|Sound playback|Sound playback|
|---|---|----|
|↓|↓|↓|
|Using speakers🔊|Using speakers🔊|Using headphones🎧|
|↓|↓|↓|
|Using regular Android sound API's(Audio players, media, system sounds)|Using Low latecy API. For example using Oboe library|Regular or low latency API|
|↓|↓|↓|
|Samsung additional software processing ✅| Bypassed directly to speaker drivers ❌|Phone don't know what headphones you are using so it will not try to tune sound on playback device it knows nothing about. ❌ |
|↓|↓|↓|
|`Enhanced sound` but with latency not appropriate for music applications|Low latency `audio without enhancements, that sounds bad` because manufacturer enhancment was bypassed|`Audio without enhancements, low latency too if low latency API used`, we just don't notice that this processing is disabled becasue it is disabled for both: low latency and regular sound API|

<br/>
Maybe this `ENHANCEMENT` is just a speakers driver mode that will not alter audio signal itslef digitally, but alters how speaker drivers are playing anything that comes in, but result is the same, you get `ENHANCEMENT` if you are using phone's speakers.

# Koala's sample browser led me think it was Koala's fault
It seems that Koala sample browser and pads in project are using different sound APIs.     
When you preview sample in Sample browser you get all Samsung enhancements and samples sound even a good bit louder, but when you import same sample to pad it uses low level API and this why Sample browser and pad in Koala sound not the same, again unless you are using headphones.  

This is why my initall thought was that maybe Koala's audio engine degreades audio quality on purpouse to fit into tight mobile CPU budget. I also thought that maybe Koala uses low quality copies of audio to manipulate in real time and then replace with full quality samples on export(like it does DaVinchi resolve with Proxy files).

So there is only Samsung to blame, I'm curius now if it is applies to some other models too. And if any other manufacturers are doing this as well.

# Bandlab
I used this app as a reference in my research and there is not much to say about this app except that not-surprisingly they also use low latency audio on Android and they have same issue, projects sound beter when exported as audio or when using headphones.  
Also, latency there is unplayable for some reason anyway (Roundtrip audio is around 40ms. Not sure if this is true.).

# Outro
**Important bit here is it is not Koala issue at all** and I corrected my one star review =). This is how audio is working on Samsung phones I guess. Please don't buy Samsung for music applications. And maybe for anyting, but if you already have one you have to use headphones or wired speaker to have decent quality or sound in low-latency audio applications.  

**PRO TIP:** If you want to make music on your phone, make sure you can charge your phone while using headphones.

**PRO TIP:** You eventually will want to use some kind of MIDI controller to have velocity, so you have to `make sure you can have headphones(or external spearker), charging and midi controller connected at the same time` =). I heard that wireless MIDI is not that bad, but your mileage may vary. There are adapters that can charge via type-c and output audio via 3.5 jack at the same time, I have one, but not really happy with it.
It seems chip inside have IDLE state and when you play audio after silence there is slight fade-in before audio plays, and it switches to IDLE state rather fast(10-15 sec.). This is not happening with official Samsung 3.5 jack dongle, but it does not have charging.

**PRO TIP:** If you want to buy dedicated mobile device for music, maybe iPad with controller is you best bet. Lots of apps that have interoperability and common plugin formats. For example you can use Koala as plugin in other plugin hosts, it is crazy how much more advanced iPads and iPhones are in this field.