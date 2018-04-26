const id = 'YOUR_CLIENT_ID';
const sec = 'YOUR_SECRET_ID';
const params = `?client_id=${id}&client_secret=${sec}`;

const getProfile = username =>
  fetch(`https://api.github.com/users/${username}${params}`)
    .then(res => res.json());

const getRepos = username =>
  fetch(
    `https://api.github.com/users/${username}/repos${params}&per_page=100`
  ).then(res => res.json());

const getStarCount = repos =>
  repos.reduce((count, repo) => count + repo.stargazers_count, 0);

const calculateScore = (profile, repos) => {
  const followers = profile.followers;
  const totalStars = getStarCount(repos);
  return followers * 3 + totalStars;
};

const handleError = error => {
  console.warn(error);
  return null;
};

const getUserData = player =>
  Promise.all([getProfile(player), getRepos(player)]).then(data => {
    const profile = data[0];
    const repos = data[1];
    return {
      profile,
      score: calculateScore(profile, repos)
    };
  });

const sortPlayers = players => players.sort((a, b) => b.score - a.score);

export const battle = players =>
  Promise.all(players.map(getUserData))
    .then(sortPlayers)
    .catch(handleError);

export const fetchPopularRepos = language => {
  const encodedURI = window.encodeURI(
    `https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`
  );
  return fetch(encodedURI)
    .then(res => res.json())
    .then(data => data.items);
};
