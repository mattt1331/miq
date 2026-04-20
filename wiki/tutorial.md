# `miq` Tutorial

`miq` enables you to control DCAs and channel parameters using cues created and fired through a sane interface. This tutorial explains the basics of creating and using cues in `miq`.

## Creating Cues

Cues are programmed for `miq` in a spreadsheet. In this example, we'll work in a Google Sheet.
<!-- but feel free to follow along in a file beacuse we totally support that TODO-->

Let's start by copying the template liked [here](https://www.youtube.com/watch?v=dQw4w9WgXcQ). It should look something like this:

![template](TODO)

All of our actors go in the left column. Let's fill those in and take a look at how cues are programmed.

A cue consists of one or more columns that contain instructions for what `miq` should do when the cue is fired. The cue also gets a {name? description? TODO} which go above the _rightmost_ column associated with that cue. See the image:

![template w/ actors and highlighted cues](TODO)

At the top of each column (but below the title{? TODO}) goes a keyword, which tells `miq` what kind of instructions that column contains. The first keyword we'll use is `MIC`. This assigns the channel (on the board) listed in an actor's row to that actor. We use this at the start of the show and after any mic changes. Let's fill in the `MIC` column in the first cue now to tell `miq` who has which mic.

![template w/ actors and MIC column](TODO)

Now, the show is getting underway and we need some DCAs to control levels. Our next cue will assign actors to DCAs. This works a lot like assigning channels with `MIC`. However, the keyword here is `DCA`. Actors will be assigned to the DCA listed in their row. If an actor is assigned to a DCA, they will be unmuted. Otherwise, they will be muted. Let's fill in DCAs for our cue.
<!-- TODO: can we name dcas? otherwise we don't have character names anywhere. also might be good to be able to name individual characters. discuss? -->

![template w/ prev and dcas](TODO)

Note that `miq` won't touch channels higher than the highest channel you assign with `MIC`. This means, for instance, that if you have your pit after your actors `miq` won't do anything silly like muting them for not being assigned to a DCA.

This is enough to start mixing with `miq`. If you want, you can skip to [connecting to the board](#setting-up-for-the-show), or read on for how to control other parameters.

`miq` can also control channel parameters like pan and bus sends. This involves three different keywords: `SET`, `TEMP`, and `REVERT`.

`SET`, aka `SET_AND_DEFAULT`, is used to set a channel parameter and make that the default value for that parameter.

`TEMP`, aka `TEMP_SET`, is used to temporarily override the value set by `SET` for a parameter.

`REVERT`, aka `REVERT_TEMP`, is used to revert a parameter back to the default (set using `SET`) after it has been modified by `TEMP`.

Certain parameters come with sensible default values that do not need to be `SET`. For instance, pan's default is center.

![example image](TODO)

## Setting Up for the Show

Step 1: Add your cues to `miq`

Database -> Add New -> Fill in info

Step 2: Connect to the board

Settings -> Mixer Connection -> Select your board in "Connection mode" dropdown and set up as indicated

Setp 3:

Enjoy
