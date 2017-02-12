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
import * as BEMHelper from "react-bem-helper";
import {Link} from "react-router";

import {ArticleBriefModel} from "./models";

import "./Article.scss";

interface Props {
    model: ArticleBriefModel;
    onDelete: (id: string) => void;
}

const bem = new BEMHelper("Article");

function getMonthShortText(date: Date): string {
    const MONTHS = ["Jan", "Feb", "Mar", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov",
                    "Dec"];
    return MONTHS[date.getMonth()];
}

export default function Article({model, onDelete}: Props): JSX.Element {
    const onDeleteClick = () => {
        onDelete(model.id);
    };

    return (
        <article {...bem()}>
            <div {...bem("header-image-wrapper")}>
                <img {...bem("header-image")} src={model.headerImage} />
            </div>
            <section {...bem("detail-wrapper")}>
                <h2 {...bem("title")}>{model.title}</h2>

                <div>
                    <Link to={`/publications/${model.publication}/articles/edit/${model.id}`}>
                        <button>Edit</button>
                    </Link>
                    <button onClick={onDeleteClick}>Delete</button>
                </div>

                <div>
                    <span {...bem("date")}>
                        {getMonthShortText(model.datePublished)} {model.datePublished.getDate()}
                    </span>
                    {model.brief ? " • " + model.brief : ""}
                </div>
            </section>
        </article>
    );
}
