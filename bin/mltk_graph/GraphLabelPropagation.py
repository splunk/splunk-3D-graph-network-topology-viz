#!/usr/bin/env python
from base import BaseAlgo, TransformerMixin
from codec import codecs_manager
from util.param_util import convert_params
import pandas as pd
import networkx as nx
from cexc import get_messages_logger, get_logger
debug = get_messages_logger()

class GraphLabelPropagation(TransformerMixin, BaseAlgo):

    def __init__(self, options):
        debug.info('NetworkX Version {}'.format( nx.__version__))
        self.handle_options(options)

    # call same logic as in fit
    def apply(self, df, options):
        return self.fit(df, options)

    # compute connected components
    def fit(self, df, options):
        # Make a copy of data, to not alter original dataframe
        X = df.copy()

        # create a directed graph
        graph = nx.Graph()
        src_dest_name = self.feature_variables
        dfg = X[src_dest_name]
        for index, row in dfg.iterrows():
            graph.add_edge(row[src_dest_name[0]], row[src_dest_name[1]]) #, value=row['value'])

        # compute label propagation
        comps = nx.algorithms.community.label_propagation.label_propagation_communities(graph)
        d = dict()
        i = 0
        for x in comps:
            i=i+1
            for n in x:
                d[n]=i
        # join connected components on first key
        X = df.join(pd.DataFrame.from_dict(d, orient='index', columns=['labeled_community']), on=src_dest_name[0])

        # return results
        return X

    @staticmethod
    def register_codecs():
        from codec.codecs import SimpleObjectCodec
        codecs_manager.add_codec('mltk_graph.GraphLabelPropagation', 'GraphLabelPropagation', SimpleObjectCodec)
