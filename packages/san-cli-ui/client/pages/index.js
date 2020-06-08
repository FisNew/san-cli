/**
 * @file index
 * @author zttonly
 */

import san from 'san';
import {router} from 'san-router';
import createApolloServer from '@lib/create-apollo-server';
import {register} from '@lib/san-apollo';
import localization from '@lib/san-localization';
import Project from './project';
import About from '@components/about';
import NotFound from '@components/not-found';

// eslint-disable-next-line no-undef
const graphqlEndpoint = APP_GRAPHQL_ENDPOINT || `ws://${location.host}/graphql`;

// add $apollo to San Components
register(san, createApolloServer(graphqlEndpoint));

// add localization
localization(san);

const routes = [
    {rule: '/', Component: Project, target: '#app'},
    {rule: '/project', Component: Project, target: '#app'},
    {rule: '/project/:nav', Component: Project, target: '#app'},
    {rule: '/about', Component: About, target: '#app'},
    {rule: '/notfound', Component: NotFound, target: '#app'}
];

routes.forEach(option => router.add(option));

router.start();
