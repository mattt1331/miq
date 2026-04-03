# `miq` Tutorial

`miq` enables you to control DCAs and channel parameters using cues created and fired through a sane interface. This tutorial explains the basics of creating and using cues in `miq`.

## Creating Cues

Cues are programmed for `miq` in a spreadsheet. In this example, we'll work in a Google Sheet( but feel free to follow along in a file beacuse we toootally support that).

Let's start by copying the template liked [here](https://www.youtube.com/watch?v=dQw4w9WgXcQ). It should look something like this:

![template](TODO)

All of our actors go in the left column. Let's fill those in and take a look at how cues are programmed.

A cue consists of one or more columns that contain instructions for what `miq` should do when the cue is fired. The cue also gets a {name? description? TODO} which go above the _rightmost_ column associated with that cue. See the image:

![template w/ actors and highlighted cues](TODO)

At the top of each column (but below the title{? TODO}) goes a keyword, which tells `miq` what kind of instructions that column contains. The first keyword we'll use is `MIC`. This assigns the channel (on the board) listed in an actor's row to that actor. We use this at the start of the show and after any mic changes. Let's fill in the `MIC` column in the first cue now to tell `miq` who has which mic.

![template w/ actors and MIC column](TODO)

Now, the show is getting underway and we need some DCAs to control levels. Our next cue will assign actors to DCAs. {here is how}

![template w/ prev and dcas](TODO)

When this cue is fired, `miq` will {describe behavior}

This is enough to start mixing with `miq`. If you want, you can skip to [connecting to the board](https://www.youtube.com/watch?v=dQw4w9WgXcQ), or read on for how to control other parameters using `miq`.

- make more dcas and pan

## Setting Up for the Show

- import into miq
- connect to board
- ~suffer~ enjoy
