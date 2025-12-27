---

title: "Put it on master: Recall Sampler"
tags: vst en c++ dsp juce
---

This is really just a notification post about VST that I made 4 months ago. Since apparently what is not online does not exists.

![recall sampler ui, another sad example of "programmer makes UI"](/assets/images/recall-sampler-vst-ui.png)

<!--more-->
MIT License code and binaries are [here](https://github.com/ummshsh/Recall-Sampler).

4 months ago I've created **Recall Sampler** VST. This is a rather simple sampler that records everything it hears, similar to tape loop. And then you can drag parts of the recording and drop anywhere, to DAW track, to desktop, etc. 

This was inspired by [GlobalSampler](https://www.reapertips.com/post/capture-anything-in-reaper-with-global-sampler) for Reaper(::not really using this now) and [Rolling Sampler VST](https://www.birdsthings.com/) which costs money.

Use cases are mainly for sound design appplications. 
- When you tweak something or switch presets on delays and VSTs make weird but cool sound, you can always recall that as long as you have Recall Sampler on your master channel(::you can put it anywhere really, but master seems more logical) and use it as audio clip.
- It can also be started in standalone mode in Windows, this way you can record audio form your other applications, like YouTube or games...
- This is also helpfull for quick resampling, you may play something from your MIDI keyboard and tweak things with your mouse at the same time, you can instantly drag and drop result to new track instead of <press record, perform, write automation and bounce to new track> flow.
- Most of the DAWs playback audio from their file explorers through master channel, so you can imagine that there is always invisible channel dedicated just for file explorer. And, if you have Recall on master, this allows for recording of you switching samples or getting short versions of the long samples to your project. This is usefull for at least me when I try to sample mini disk rips(::each 1h long) and do not want to save whole minidisk rip in project files(::I try to always save all samples to DAW projects, this way I can reorganize my sample librarires and do not worry about 500 projects that reference samples from there, they get their own copies, storage is cheap)

Why I waited 4 months to publish this in this blog? I had an idea to change design to be more modern and good looking overall before that and that never happened, so... I even had [Melatonin Component Inspector](https://github.com/sudara/melatonin_inspector) installed to change some things live in inspector instead of <change color, rebuild>, but design is just sooo hard. 

> There are registrars with VST plugins. Once you publish your plugin to GitHub, they will write you and ask for proper readme, can submit a bug or request you to create release with binaries.

Also, everyone seems to be creating VSTs around me. Which even made me go back to my old Granular sampler project, it still works, even can sound good, but is very-very alpha version. I've posted previously how it sounds:

<iframe width="576" height="1024" src="/assets/video/rainular.mp4" allow="autoplay 'none'" frameborder="0" allowfullscreen></iframe>
