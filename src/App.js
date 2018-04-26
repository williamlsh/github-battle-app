import React, { Component } from 'react';
import { Route, Switch, Link, NavLink } from 'react-router-dom';
import queryString from 'query-string';
import * as API from './utils/api';
import './App.css';

const Nav = () => {
  return (
    <ul className="nav">
      <li>
        <NavLink exact to="/">
          Home
        </NavLink>
      </li>
      <li>
        <NavLink to="/battle">Battle</NavLink>
      </li>
      <li>
        <NavLink to="/popular">Popular</NavLink>
      </li>
    </ul>
  );
};

const RepoGrid = props => {
  return (
    <ul className="popular-list">
      {props.repos.map((repo, index) => (
        <li key={repo.name} className="popular-item">
          <div className="popular-rank">#{index + 1}</div>
          <ul className="space-list-items">
            <li>
              <img
                className="avatar"
                src={repo.owner.avatar_url}
                alt={`Avatar for ${repo.owner.login}`}
              />
            </li>
            <li>
              <a href={repo.html_url}>{repo.name}</a>
            </li>
            <li>@{repo.owner.login}</li>
            <li>{repo.stargazers_count} stars</li>
          </ul>
        </li>
      ))}
    </ul>
  );
};

// Add any languages here.
const SelectLanguage = props => {
  const languages = [
    'All',
    'JavaScript',
    'Ruby',
    'Java',
    'CSS',
    'Python',
    'Go',
    'Rust',
    'Heskell',
    'PHP',
    'Typescript',
    'C',
    'C++'
  ];
  return (
    <ul className="languages">
      {languages.map(lang => (
        <li
          style={lang === props.selectedLanguage ? { color: '#d0021b' } : null}
          onClick={props.onSelect.bind(null, lang)}
          key={lang}
        >
          {lang}
        </li>
      ))}
    </ul>
  );
};

class Popular extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLanguage: 'All',
      repos: null
    };
  }
  updateLanguage = lang => {
    this.setState({
      selectedLanguage: lang,
      repos: null
    });
    API.fetchPopularRepos(lang).then(repos => {
      this.setState({ repos });
      console.log(repos);
    });
  };
  componentDidMount() {
    this.updateLanguage(this.state.selectedLanguage);
  }
  render() {
    return (
      <React.Fragment>
        <SelectLanguage
          selectedLanguage={this.state.selectedLanguage}
          onSelect={this.updateLanguage}
        />
        {!this.state.repos ? (
          <Loading />
        ) : (
          <RepoGrid repos={this.state.repos} />
        )}
      </React.Fragment>
    );
  }
}

const defaultLoadingProps = {
  text: 'Loading',
  speed: 300
};

// This is a shared component.
class Loading extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: defaultLoadingProps.text
    };
  }
  componentDidMount() {
    const stopper = `${defaultLoadingProps.text}...`;
    this.interval = window.setInterval(() => {
      if (this.state.text === stopper) {
        this.setState({
          text: defaultLoadingProps.text
        });
      } else {
        // The maximum dots are 3.
        this.setState(prevState => ({
          text: `${prevState.text}.`
        }));
      }
    }, defaultLoadingProps.speed);
  }
  componentWillUnmount() {
    window.clearInterval(this.interval);
  }
  render() {
    return (
      <p
        style={{
          textAlign: 'center',
          fontSize: '35px'
        }}
      >
        {this.state.text}
      </p>
    );
  }
}

const Profile = props => {
  const info = props.info;
  return (
    <PlayerPreview username={info.login} avatar={info.avatar_url}>
      <ul className="space-list-items">
        {info.name && <li>{info.name}</li>}
        {info.location && <li>{info.location}</li>}
        {info.company && <li>{info.company}</li>}
        <li>Followers: {info.followers}</li>
        <li>Following: {info.following}</li>
        <li>Public Repos: {info.public_repos}</li>
        {info.blog && (
          <li>
            <a href={info.blog}>{info.blog}</a>
          </li>
        )}
      </ul>
    </PlayerPreview>
  );
};

const Player = props => {
  return (
    <div>
      <h1 className="header">{props.label}</h1>
      <h3 style={{ textAlign: 'center' }}>Score: {props.score}</h3>
      <Profile info={props.profile} />
    </div>
  );
};

// * This major Results component has its own state. Battle => Results.
class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {
      winner: null,
      loser: null,
      error: null,
      loading: true
    };
  }

  componentDidMount() {
    const players = queryString.parse(this.props.location.search);
    API.battle([players.playerOneName, players.playerTwoName]).then(players => {
      if (players === null) {
        return this.setState({
          error:
            'Looks like there was an error. Check that both users exist on Github.',
          loading: false
        });
      }
      this.setState({
        error: null,
        winner: players[0],
        loser: players[1],
        loading: false
      });
    });
  }

  render() {
    const error = this.state.error;
    const winner = this.state.winner;
    const loser = this.state.loser;
    const loading = this.state.loading;

    if (loading) {
      return <Loading />;
    }
    if (error) {
      return (
        <div>
          <p>{error}</p>
          <Link to="/battle">Reset</Link>
        </div>
      );
    }
    return (
      <div className="row">
        <Player label="Winner" score={winner.score} profile={winner.profile} />
        <Player label="Loser" score={loser.score} profile={loser.profile} />
      </div>
    );
  }
}

// * This is a shared component in deferent routes.
const PlayerPreview = props => {
  return (
    <div>
      <div className="column">
        <img
          className="avatar"
          src={props.avatar}
          alt={`Avatar for ${props.username}`}
        />
        <h2 className="username">@{props.username}</h2>
      </div>
      {props.children}
    </div>
  );
};

// * This independent, shared, controlled PlayerInput component has its own input state.
class PlayerInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: ''
    };
  }
  handleChange = e => {
    const username = e.target.value;
    this.setState({
      username
    });
  };
  handleSubmit = e => {
    e.preventDefault();
    this.props.onSubmit(this.props.id, this.state.username);
  };
  render() {
    return (
      <form className="column" onSubmit={this.handleSubmit}>
        <label htmlFor="username" className="header">
          {this.props.label}
        </label>
        <input
          id="username"
          placeholder="type github username here..."
          type="text"
          value={this.state.username}
          autoComplete="off"
          onChange={this.handleChange}
        />
        <button
          className="button"
          type="submit"
          disabled={!this.state.username}
        >
          Submit
        </button>
      </form>
    );
  }
}

// * The major Battle Component has its own state.
class Battle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playerOneName: '',
      playerTwoName: '',
      playerOneImage: null,
      playerTwoImage: null
    };
  }
  handleSubmit = (id, username) => {
    const playerInfo =
      id === 'playerOne'
        ? {
            playerOneName: username,
            playerOneImage: `https://github.com/${username}.png?size=200`
          }
        : {
            playerTwoName: username,
            playerTwoImage: `https://github.com/${username}.png?size=200`
          };
    this.setState({ ...playerInfo });
  };
  handleReset = id => {
    const playerInfo =
      id === 'playerOne'
        ? {
            playerOneName: '',
            playerOneImage: null
          }
        : {
            playerTwoName: '',
            playerTwoImage: null
          };
    this.setState({ ...playerInfo });
  };
  render() {
    const match = this.props.match;
    const playerOneName = this.state.playerOneName;
    const playerOneImage = this.state.playerOneImage;
    const playerTwoName = this.state.playerTwoName;
    const playerTwoImage = this.state.playerTwoImage;
    return (
      <React.Fragment>
        <div className="row">
          {!playerOneName && (
            <PlayerInput
              id="playerOne"
              label="Player One"
              onSubmit={this.handleSubmit}
            />
          )}
          {playerOneImage !== null && (
            <PlayerPreview avatar={playerOneImage} username={playerOneName}>
              <button
                className="reset"
                onClick={this.handleReset.bind(this, 'playerOne')}
              >
                Reset
              </button>
            </PlayerPreview>
          )}
          {!playerTwoName && (
            <PlayerInput
              id="playerTwo"
              label="Player Two"
              onSubmit={this.handleSubmit}
            />
          )}
          {playerTwoImage !== null && (
            <PlayerPreview avatar={playerTwoImage} username={playerTwoName}>
              <button
                className="reset"
                onClick={this.handleReset.bind(this, 'playerTwo')}
              >
                Reset
              </button>
            </PlayerPreview>
          )}
        </div>
        {playerOneImage &&
          playerTwoImage && (
            <Link
              className="button"
              to={{
                pathname: `${match.url}/results`,
                search: `?playerOneName=${playerOneName}&playerTwoName=${playerTwoName}`
              }}
            >
              Battle
            </Link>
          )}
      </React.Fragment>
    );
  }
}

const Home = () => (
  <div className="home-container">
    <h1>Github Battle: Battle your friends... and stuff.</h1>
    <Link className="button" to="/battle">
      Battle
    </Link>
  </div>
);

// The parent component of all which has its routes but without state.
class App extends Component {
  render() {
    return (
      <React.StrictMode>
        <Nav />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/battle" component={Battle} />
          <Route path="/battle/results" component={Results} />
          <Route path="/popular" component={Popular} />
          <Route render={() => <p>Not Found</p>} />
        </Switch>
      </React.StrictMode>
    );
  }
}

export default App;
