import Home from '@/pages/home';
import { FunctionalComponent } from 'preact';
import { Route, Router } from 'preact-router';

const App: FunctionalComponent = () => {

	return (

		<Router>
			<Route path="/" component={Home} />
		</Router>

	);
};

export default App;
