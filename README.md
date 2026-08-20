# Grandmaster Clock

ClockMate

Build ClockMate, a simple, polished mobile-first chess clock app. It is a companion app to SchackMate.

The app should be designed primarily for use on a smartphone in portrait orientation, placed next to a physical chess board and used exactly like a traditional chess clock.

The MVP should be completely self-contained and work offline, with no accounts, backend, database, networking or game history.

1. Home Screen

The home screen lets the user select a chess time control.

Organise the presets into three sections:

BULLET

1:00 - 1 minute per player

1+1 - 1 minute + 1 second increment

2+1 - 2 minutes + 1 second increment

BLITZ

3:00 - 3 minutes per player

3+2 - 3 minutes + 2 seconds increment

5:00 - 5 minutes per player

RAPID

10:00 - 10 minutes per player

15+10 - 15 minutes + 10 seconds increment

30:00 - 30 minutes per player

CUSTOM

A tenth option allowing the user to define:

Minutes

Seconds

Increment in seconds

The custom setup should use a very simple interface and clearly display the resulting format, e.g. 7+3.

The selected time control should be visually highlighted.

Add a prominent Start Game button.

Keep the interface clean, modern and extremely easy to understand at a glance.

2. Chess Clock Screen

The game screen is the core of ClockMate.

It must be optimised for portrait smartphone use.

The screen should essentially be divided into:

Upper area: Black

Small central control area

Lower area: White

Each player's area should occupy as much of the available screen as possible.

Black area

Display:

BLACK

Remaining time

When the game has not started yet, show a prominent START indicator

The entire Black area should be a large touch target.

White area

Display:

WHITE

Remaining time

The entire White area should also be a large touch target.

Orientation

The Black player's complete display should be rotated 180 degrees, including:

Player name

Clock

Relevant visual indicators

This means the phone can sit beside the chess board and each player can naturally read their own clock from their side.

White's display remains normally oriented.

3. Starting the Clock

The initial state is special.

Both clocks display their full initial time.

For example:

5:00.0

Black's area displays:

START

The game does NOT start counting immediately.

When Black presses his area for the first time:

The START indicator disappears.

White's clock starts counting down.

Black's clock remains at the full initial time.

White can now make the first chess move.

When White finishes the move, White presses his side.

White's clock stops.

The Fischer increment is added to White's clock.

Black's clock starts counting down.

This behaviour is intentional.

It reflects the normal use of a chess clock where the clock is started before White makes the first move.

4. Normal Clock Operation

After the initial start:

When White presses

Stop White's clock.

Add White's Fischer increment.

Start Black's clock.

When Black presses

Stop Black's clock.

Add Black's Fischer increment.

Start White's clock.

Only one clock can ever be running at a time.

The transition between clocks must be immediate and accurate.

The clock should use a reliable timing mechanism rather than relying on repeatedly decrementing a displayed number.

The underlying timer should account correctly for elapsed real time, including when the app is temporarily interrupted.

5. Time Display

Display the remaining time prominently using large typography.

During most of the game, use a clean format such as:

5:00.0

or, where appropriate, adapt the precision so the display remains easy to read.

The most important requirement is that the display is highly readable from across a chess board.

Prioritise:

Very large numbers

High contrast

Minimal visual clutter

Clear active/inactive state

The active player's clock should be visually distinguishable from the inactive player's clock.

6. Low-Time Warnings

Make low remaining time increasingly visually obvious.

Suggested behaviour:

Above 30 seconds

Normal appearance.

Below 30 seconds

Introduce a noticeable warning state.

Below 10 seconds

Make the warning much more prominent.

Also provide an optional audible warning.

For example, use a short beep/tick as the remaining time becomes critical.

Use vibration where supported.

The warnings should be designed so that they are useful during an actual chess game without being excessively distracting.

The exact thresholds and visual treatment can be refined during implementation.

7. Timeout

When a player's clock reaches zero:

Stop both clocks immediately.

The game is over.

Do not allow further clock presses.

Display a very prominent timeout state.

For example:

RED FLAG

White lost on time

or:

RED FLAG

Black lost on time

The timeout screen should be visually dramatic and impossible to miss.

Use a strong red visual treatment and a suitable sound/vibration notification.

The winning player's time can remain visible.

Provide a clear button to return to the main screen.

8. Pause

A pause function is mandatory.

Place a small, clearly visible Pause button in the central area between the Black and White clock areas.

Do NOT make Pause part of either player's large touch area.

When Pause is pressed:

Freeze the active clock.

Freeze the entire game.

Make it obvious that the clock is paused.

Show a clear Resume action.

The pause state should prevent accidental clock presses from changing the game state.

The user should be able to resume exactly where they left off.

Example:

PAUSED

RESUME

Optionally provide a secondary action to return to the main screen.

9. Returning to the Main Screen

In the lower/central control area, provide a way to leave the current game.

However, avoid making it too easy to accidentally destroy a game in progress.

If the user attempts to leave an active game, show a simple confirmation:

Leave game?

Cancel
Leave

No game history needs to be saved.

Returning to the main screen allows the user to select another time control.

10. Prevent Screen Lock

This is critical.

While a chess game is running, prevent the phone screen from going to sleep or locking automatically.

The screen should remain awake for the entire game.

When the user returns to the home screen or leaves the game, normal device screen-lock behaviour should resume.

11. Sound and Haptic Feedback

Use subtle sound/haptic feedback where appropriate.

Examples:

Optional short sound when a player presses their clock.

Low-time warning sounds.

Strong timeout sound.

Optional vibration for important events.

Do not make sounds annoying or excessive.

If practical, include a simple settings mechanism for enabling/disabling sound and vibration.

For the MVP, this can be very simple.

12. Accuracy and Timer Behaviour

Chess-clock accuracy is important.

Do NOT implement the clock simply as:

remainingTime -= 1000ms

on every timer callback.

Instead, maintain a reliable internal representation of:

Initial time

Increment

Current remaining time

Which player is active

Timestamp when the active period started

Calculate remaining time from actual elapsed time.

The displayed clock can update frequently for smooth visual feedback, while the underlying state remains based on real elapsed time.

The timer must also behave correctly if the application temporarily loses focus.

13. Game State

The MVP only needs a small state machine.

Possible states:

NOT_STARTED

WHITE_RUNNING

BLACK_RUNNING

PAUSED

WHITE_TIMEOUT

BLACK_TIMEOUT

Transitions should be explicit and predictable.

Important rule:

Never allow both clocks to run simultaneously.

14. Design Philosophy

ClockMate should feel like a real chess clock, not like a generic timer app.

Prioritise:

Extremely large clock displays

Instant touch response

Minimal UI

High readability

Strong visual feedback

No unnecessary features

No login

No network dependency

No advertisements

No game history

No chessboard required

The user should be able to open the app, select 3+2, tap Start Game, put the phone beside the board and immediately start playing.

15. Responsive Design

Although portrait smartphone use is the primary target, make the layout responsive enough to work across different phone sizes.

The two player areas should dynamically use the available vertical space.

The central controls should consume as little space as possible.

The clock digits should scale appropriately according to screen size.

Do not allow the timer to become cramped or overlap other UI elements.

16. MVP Scope

Do NOT add features unless they are necessary for the core experience.

Explicitly out of scope for the MVP:

User accounts

Online games

Multiplayer networking

Game history

Saved games

Move notation

Chess engine

Chess board

Elo/rating

Statistics

Social features

Cloud synchronisation

Undo move

The MVP should be a rock-solid, beautiful, reliable chess clock.

17. Final UX Goal

The complete interaction should feel like this:

Open ClockMate

→ Select 3+2

→ Press Start Game

→ Both clocks show 3:00.0

→ Black presses his large area

→ White clock starts

→ White makes his move

→ White presses his area

→ White gets +2 seconds

→ Black clock starts

→ Black makes his move

→ Black presses his area

→ Black gets +2 seconds

→ Continue until the game ends

→ If either player reaches zero, show the red flag and:

White lost on time

or

Black lost on time

→ User returns to the main screen and can start another game.

The app should make this interaction feel instantaneous, obvious and satisfying.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tickmate.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/da3c37d8-ef3c-4ddb-8c0b-be9c77a8f007).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
