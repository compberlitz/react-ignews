import {query} from 'faunadb';

import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';

export async function saveSubscription(subscriptionId: string, customerId: string, createAction = false){
    console.log(subscriptionId, customerId, createAction);
    const userRef = await fauna.query(
        query.Select(
            "ref",
            query.Get(
                query.Match(
                    query.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    )

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
    }

    console.log(subscriptionData);

    if(createAction){
        await fauna.query(
            query.If(
                query.Not(
                    query.Exists(
                        query.Match(
                            query.Index('subscription_by_user_and_status'),
                            userRef,
                            'active'
                        )
                    ),
                ),
                query.Create(
                    query.Collection('subscriptions'),
                    {
                        data: subscriptionData
                    }
                ),
                query.Get(
                    query.Match(
                        query.Index('subscription_by_user_id'),
                        userRef
                    )
                )
            )
        )
    }else{
        await fauna.query(
            query.Replace(
                query.Select(
                    "ref",
                    query.Get(
                        query.Match(
                            query.Index('subscription_by_id'),
                            subscriptionId,
                        )
                    )
                ),
                {
                    data: subscriptionData
                }
            )
        )
    }
}