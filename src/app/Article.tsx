/**
 * Article.tsx
 *
 * Created by Zander Otavka on 2/8/16.
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
import {Link} from "react-router";

import {ArticleModel} from "./models";

interface Props {
    model: ArticleModel;
    onDelete: (id: string) => void;
}

export default function Article({model, onDelete}: Props): JSX.Element {
    const onDeleteClick = () => {
        onDelete(model.id);
    };

    return (
        <article style={{margin: "20px 0"}}>
            <h2 style={{marginBottom: "0"}}>{model.title}</h2>
            <section>{model.content}</section>

            <Link to={`/publications/${model.publicationId}/articles/edit/${model.id}`}>
                <button>Edit</button>
            </Link>
            <button onClick={onDeleteClick}>Delete</button>
        </article>
    );
}
