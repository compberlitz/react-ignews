import {render, screen} from '@testing-library/react';
import { getPrismicClient } from '../../services/prismic';
import Posts, { getStaticProps } from '../../pages/posts';
import { mocked } from 'ts-jest/utils';

jest.mock('../../services/prismic')

const posts = [
    { slug: 'my-new-post', title: 'My New Post', except: 'Post excerpt', updatedAt: '10 de Abril'}
]

describe('Posts page', () => {
    it('render correctly', () => {
        render(<Posts posts={posts} />)

        expect(screen.getByText('My New Post')).toBeInTheDocument();
    })


    it('loads initial data', async () => {
        const mockedGetPrismicClientMocked = mocked(getPrismicClient);

        mockedGetPrismicClientMocked.mockReturnValueOnce({
            query: jest.fn().mockResolvedValueOnce({
                results: [
                    {
                        uid: 'my-new-post',
                        data: {
                            title: [
                                {type: 'heading', text: 'My new post'}
                            ],
                            content: [
                                {type: 'paragraph', text: 'Post excerpt'}
                            ],
                        },
                        last_publication_date: '04-01-2021'
                    }
                ]
            })
        } as any);

        const response = await getStaticProps({});

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    posts: [{
                        slug: 'my-new-post', 
                        title: 'My new post',
                        except: 'Post excerpt',
                        updatedAt: '2021 M04 01'
                    }]
                }
            })
        )
    })
})