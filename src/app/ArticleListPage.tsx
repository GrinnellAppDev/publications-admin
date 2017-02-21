/**
 * ArticlesListPage.tsx
 *
 * Created by Zander Otavka on 2/8/17.
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

import {RouteComponentProps} from "react-router"
import {connect} from "react-redux"

import ArticleList, {StateProps, DispatchProps} from "./ArticleList"
import {StateModel} from "./state/models"
// import api from "./state/api"
import {getPublications, getArticles} from "./state/selectors"
// import {clearArticlesAction, deleteArticleAction} from "./state/actions"

interface RouteParams {
    publicationId?: string
}

interface OwnProps extends RouteComponentProps<RouteParams, {}> {
}

const withReduxConnect = connect<StateProps, DispatchProps, OwnProps>(
    (state: StateModel, ownProps) => ({
        articles: getArticles(state),
        publications: getPublications(state),
        isLoading: state.isLoadingArticles,
        currentPublication: state.publicationsById[ownProps.params.publicationId],
    }),

    dispatch => ({
        onRefresh: () => {
            return
        },
        onArticleDelete: id => {
            return
        },
    }),
)

export default withReduxConnect(ArticleList)

/*
class AlreadyLoadingError extends Error {
    isAlreadyLoadingError: boolean = true
    static isTypeOf(err: any): err is AlreadyLoadingError {
        return !!(err as AlreadyLoadingError).isAlreadyLoadingError
    }

    constructor() {
        super("Already loading.")
    }
}

interface State {
    articles: ArticleBriefModel[]
    publications: PublicationModel[]
    isLoading: boolean
}

export default class ArticleListPage extends React.PureComponent<OwnProps, State> {
    state: State = {
        articles: [],
        publications: [],
        isLoading: false,
    }

    private publicationsPromise: Promise<PublicationModel[]>

    private async reload(publicationId: string = this.props.params.publicationId): Promise<void> {
        if (this.state.isLoading) {
            throw new AlreadyLoadingError()
        }

        if (publicationId) {
            this.setState({isLoading: true})
            this.setState({
                articles: await api.articles.list(publicationId),
                isLoading: false,
            })
        } else {
            const id = (await this.publicationsPromise)[0].id
            this.props.router.replace(`/publications/${id}/articles`)
        }
    }

    async componentDidMount(): Promise<void> {
        this.publicationsPromise = api.publications.list()
        this.setState({publications: await this.publicationsPromise})
        await this.reload()
    }

    async componentWillReceiveProps({params: nextParams}: OwnProps): Promise<void> {
        const {params: currentParams} = this.props

        if (nextParams.publicationId !== currentParams.publicationId) {
            await this.reload(nextParams.publicationId)
        }
    }

    private onArticleDelete = (id: string): void => {
        api.articles.remove(this.props.params.publicationId, id)

        this.setState(({articles}) => ({
            articles: articles.filter(article => article.id !== id)
        }))
    }

    private onRefresh = async (): Promise<void> => {
        try {
            await this.reload()
        } catch (err) {
            if (!AlreadyLoadingError.isTypeOf(err)) {
                throw err
            }
        }
    }

    render(): JSX.Element {
        const {params} = this.props
        const {articles, publications, isLoading} = this.state
        const currentPublication = publications.find(({id}) => id === params.publicationId)

        return <ArticleList
            {...{articles, publications, isLoading, currentPublication}}
            onArticleDelete={this.onArticleDelete} onRefresh={this.onRefresh} />
    }
}
*/
