/**
 * App.tsx
 *
 * Created by Zander Otavka on 1/16/17.
 * Copyright (C) 2016  Grinnell AppDev.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from "react";
import {Router, Route, Redirect, hashHistory} from "react-router";

import PublicationsListPage from "./PublicationsListPage";
import ArticleListPage from "./ArticleListPage";
import ArticleEditPage from "./ArticleEditPage";

import "./app.scss";

function NotFound(): JSX.Element {
    return (
        <div>
            <h1>404 Not Found</h1>
            <a href="#">Home</a>
        </div>
    );
}

export default function App(): JSX.Element {
    return (
        <Router history={hashHistory}>
            <Redirect from="/" to="/publications" />
            <Route path="/publications" component={PublicationsListPage} />
            <Route path="/publications/:publicationId/articles" component={ArticleListPage} />
            <Route path="/publications/:publicationId/articles/new" component={ArticleEditPage} />
            <Route
                path="/publications/:publicationId/articles/edit/:articleId"
                component={ArticleEditPage} />
            <Route path="*" component={NotFound} />
        </Router>
    );
}
