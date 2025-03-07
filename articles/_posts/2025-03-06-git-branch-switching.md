---
layout: post
title: "Cheat sheet: How to switch GIT branches with changes"
tags: git en
---
In case you want to switch to new branch for bugfix.

<!--more-->
# 1. Stash
This one "stashes" changes removing them from currently changed files.
- ✅ Can have multiple stashes
- ✅ Can be restored in some other branch(apply or POP)
- ❌ This command ignores new added files, they will remain as changed

```bash
// To create stash
git stash -m "Just like commit messages"

// To restore latest stash
git stash pop
// OR
git stash apply
```
# 2. Temporary commit
Just like described, just make commit with message like "TO REVERT". 

I suggest to break syntax as well 😁, just type in any file(not as comment) something like "PLEASE RESET TEMP COMMIT", so you when you will switch back to this branch you will see an error that will remind you(hopefully) of your temp commit.
```bash
// Commit your changes
git commit -m "TEMP COMMIT, TO REVERT"

// Revert changes so you can work on files again
git reset --soft HEAD~1 // this will undo 1 latest unpushed commit and move this to changed files
```
+ ✅ Simple
+ ✅ Saves all changes including new files
- ❌ Have to remember to revert this commit
- ❌ Slight headache if you push this commit

# 3. Worktrees
I haven't used this one, this one allows to have several branches checked out in different folders with some safeguards built in.

Can't explain this better than there
<iframe width="560" height="315" src="https://www.youtube.com/embed/oI631eCAQnQ?si=kRXlWTq89_9XseOz" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>