/**
 * PublicationsListPage.tsx
 *
 * Created by Zander Otavka on .
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
import {RouteComponentProps, Link} from "react-router";

import {PublicationModel} from "./models";
import api from "./api";

interface RouteOptions {
}

type Props = RouteComponentProps<RouteOptions, {}>;

interface State {
    publications: PublicationModel[];
}

export default class PublicationsListPage extends React.PureComponent<Props, State> {
    state: State = {
        publications: [],
    };

    private reload(): void {
        api.publications.list().then(publications => this.setState({publications}));
    }

    componentDidMount(): void {
        this.reload();
    }

    render(): JSX.Element {
        const {publications} = this.state;

        return (
            <div>
                <h1>Publications</h1>
                <section>
                    {publications.map(publication =>
                        <Link key={publication.id} to={`/publications/${publication.id}/articles`}>
                            {publication.name}
                        </Link>
                    )}
                </section>
            </div>
        );
    }
}
