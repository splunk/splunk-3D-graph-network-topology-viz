#!/usr/bin/env python
from base import BaseAlgo, TransformerMixin
from codec import codecs_manager
from util.param_util import convert_params
import pandas as pd
import numpy as np
import networkx as nx
from cexc import get_messages_logger, get_logger
debug = get_messages_logger()

class MinimumSpanningTree(TransformerMixin, BaseAlgo):

    def __init__(self, options):
        debug.info('NetworkX Version {}'.format( nx.__version__))
        self.handle_options(options)
        out_params = convert_params(
            options.get('params', {}),
            strs=['weight']
        )
        if 'weight' not in out_params:
            options['weight']='one'
        else:
            options['weight'] = out_params['weight']

    # call same logic as in fit
    def apply(self, df, options):
        return self.fit(df, options)

    # compute centrality scores
    def fit(self, df, options):
        # Make a copy of data, to not alter original dataframe
        X = df.copy()

        # create the graph
        G = nx.Graph()
        src_dest_name = self.feature_variables
        X['join_key'] = X[src_dest_name[0]].apply(str)+'_'+X[src_dest_name[1]].apply(str)

        if options['weight']=='one':
            for index, row in X.iterrows():
                G.add_edge(row[src_dest_name[0]],row[src_dest_name[1]], weight=1)
        else:
            for index, row in X.iterrows():
                G.add_edge(row[src_dest_name[0]],row[src_dest_name[1]], weight=row[options['weight']])
        T = nx.minimum_spanning_tree(G)

        Y = pd.DataFrame(columns=['source','destination'])

        for e in T.edges():
                Y = Y.append({'source': e[0], 'destination': e[1]}, ignore_index=True)

        Y['join_key'] = Y['source'].apply(str)+'_'+Y['destination'].apply(str)

        X = pd.merge(X,Y['join_key'],on='join_key',how='inner')
        X.drop('join_key', axis=1, inplace=True)

        return X

    @staticmethod
    def register_codecs():
        from codec.codecs import SimpleObjectCodec
        codecs_manager.add_codec('mltk_graph.MinimumSpanningTree', 'MinimumSpanningTree', SimpleObjectCodec)
