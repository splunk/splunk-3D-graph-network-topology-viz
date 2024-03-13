#!/usr/bin/env python
from base import BaseAlgo, TransformerMixin
from codec import codecs_manager
from util.param_util import convert_params
import pandas as pd
import networkx as nx
from cexc import get_messages_logger, get_logger
debug = get_messages_logger()

class GraphCentrality(TransformerMixin, BaseAlgo):

    def __init__(self, options):
        debug.info('NetworkX Version {}'.format( nx.__version__))
        self.handle_options(options)
        out_params = convert_params(
            options.get('params', {}),
            strs=['compute'],
            ints=['max_iter']
        )
        if 'max_iter' not in out_params:
            options['max_iter']=1000
        else:
            options['max_iter'] = out_params['max_iter']
        if 'compute' not in out_params:
            options['compute']='degree_centrality'
        else:
            options['compute'] = out_params['compute']

    # call same logic as in fit
    def apply(self, df, options):
        return self.fit(df, options)

    # compute centrality scores
    def fit(self, df, options):
        # Make a copy of data, to not alter original dataframe
        X = df.copy()

        # create the graph
        graph = nx.Graph()
        src_dest_name = self.feature_variables
        dfg = X[src_dest_name]
        for index, row in dfg.iterrows():
            graph.add_edge(row[src_dest_name[0]], row[src_dest_name[1]]) #, value=row['value'])

        # compute centrality
        algos = options["compute"].lstrip("\"").rstrip("\"").lower().split(',')
        outputcolumns = []
        for algo in algos:
            if algo=='degree_centrality':
                cents = nx.algorithms.centrality.degree_centrality(graph)
                outputcolumns.append(algo)
            elif algo=='betweenness_centrality':
                cents = nx.algorithms.centrality.betweenness_centrality(graph)
                outputcolumns.append(algo)
            elif algo=='eigenvector_centrality':
                cents = nx.algorithms.centrality.eigenvector_centrality(graph, max_iter=options["max_iter"])
                outputcolumns.append(algo)
            elif algo=='cluster_coefficient':
                cents = nx.algorithms.cluster.clustering(graph)
                outputcolumns.append(algo)
            else:
                continue
            degs = pd.DataFrame(list(cents.items()), columns=[src_dest_name[0], algo])
            X = X.join(degs.set_index(src_dest_name[0]), on=src_dest_name[0])

        # return results
        return X

    @staticmethod
    def register_codecs():
        from codec.codecs import SimpleObjectCodec
        codecs_manager.add_codec('mltk_graph.GraphCentrality', 'GraphCentrality', SimpleObjectCodec)
