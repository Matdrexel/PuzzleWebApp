---
bibliography: references.bib
nocite: "@*"
---

# Welcome to my project!

## Note: this application is still a work in progress!

This project is a Django Web application meant to host small puzzle games and puzzle solvers. Users can play games and each game will come with a "solver" which solves the puzzle.

The first game is the Ball Sort Puzzle game seen in many mobile games. This game is surprisingly complex and challenging to solve, so many
mobile games omit "hint" buttons since they are challenging to implement. However, I created an efficient algorithm that solves this problem!
The ball sort puzzle is actually equivalent to the water sort puzzle (Ito et al., 2023). Thus, we can create a simpler algorithm which solves the water sort puzzle then translates the solution to the ball sort puzzle! While this problem is still NP-Complete, my algorithm is highly efficient and good for most normal puzzles users will come across.

## References

Ito, T., Kawahara, J., Minato, S., Otachi, Y., Saitoh, T., Suzuki, A., Uehara, R., Uno, T., Yamanaka, K., & Yoshinaka, R. (2023). Sorting balls and water: Equivalence and computational complexity. Theoretical Computer Science, 978, 114158. https://doi.org/10.1016/j.tcs.2023.114158

## Future Plans

- Make the ballsort puzzle environment prettier
- Improve the way users see hints (ie dont show them the entire solution)
- New games!